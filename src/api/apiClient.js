import axios from 'axios';
import { API_BASE_URL } from '../config';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

let refreshPromise = null;

const getStoredToken = () => localStorage.getItem('hb_token') || '';

const clearAuthState = () => {
    localStorage.removeItem('hb_token');
    localStorage.removeItem('hb_user');
    if (window.location.pathname !== '/login') {
        window.location.href = '/login';
    }
};

const refreshAccessToken = async () => {
    const token = getStoredToken();
    if (!token) return null;

    if (!refreshPromise) {
        refreshPromise = axios.post(`${API_BASE_URL}/auth/refresh`, { token }).then((response) => {
            const nextToken = response?.data?.result?.token || response?.data?.token;
            if (nextToken) {
                localStorage.setItem('hb_token', nextToken);
                return nextToken;
            }
            return null;
        }).finally(() => {
            refreshPromise = null;
        });
    }

    return refreshPromise;
};

apiClient.interceptors.request.use((config) => {
    const token = getStoredToken();

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const nextToken = await refreshAccessToken();
                if (nextToken) {
                    originalRequest.headers.Authorization = `Bearer ${nextToken}`;
                    return apiClient(originalRequest);
                }
            } catch {
                // Refresh failed; fall through to logout cleanup.
            }

            clearAuthState();
        }

        return Promise.reject(normalizeError(error));
    }
);

export function normalizeError(error) {
    const apiMessage = error?.response?.data?.message;
    const message = apiMessage || error?.message || 'Có lỗi xảy ra. Vui lòng thử lại.';

    return {
        ...error,
        message,
    };
}

export function unwrapApiResponse(response) {
    if (!response) return null;
    const payload = response.data ?? {};
    return payload.result ?? payload;
}

export default apiClient;
