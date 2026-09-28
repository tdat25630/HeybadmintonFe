import apiClient, { unwrapApiResponse } from './apiClient';

export const sessionApi = {
    getSessions: async (page = 0, size = 10) => {
        const response = await apiClient.get('/bsession', { params: { page, size } });
        return unwrapApiResponse(response);
    },
    createSession: async (description) => {
        const response = await apiClient.post('/bsession', { description });
        return unwrapApiResponse(response);
    },
};
