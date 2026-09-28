import apiClient, { unwrapApiResponse } from './apiClient';

export const authApi = {
    login: async (username, password) => {
        const response = await apiClient.post('/auth/token', { username, password });
        return unwrapApiResponse(response);
    },
    logout: async (token) => {
        const response = await apiClient.post('/auth/logout', { token });
        return unwrapApiResponse(response);
    },
    refresh: async (token) => {
        const response = await apiClient.post('/auth/refresh', { token });
        return unwrapApiResponse(response);
    },
    introspect: async (token) => {
        const response = await apiClient.post('/auth/introspect', { token });
        return unwrapApiResponse(response);
    },
};
