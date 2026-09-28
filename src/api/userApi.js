import apiClient, { unwrapApiResponse } from './apiClient';

export const userApi = {
    getUsers: async (page = 0, size = 10) => {
        const response = await apiClient.get('/users', { params: { page, size } });
        return unwrapApiResponse(response);
    },
    getMyInfo: async () => {
        const response = await apiClient.get('/users/myInfo');
        return unwrapApiResponse(response);
    },
    searchUsername: async (keyword, page = 0, size = 10) => {
        const response = await apiClient.get('/users/searchUsername', { params: { keyword, page, size } });
        return unwrapApiResponse(response);
    },
    createUser: async (payload) => {
        const response = await apiClient.post('/users', payload);
        return unwrapApiResponse(response);
    },
    updateUser: async (userId, payload) => {
        const response = await apiClient.put(`/users/${userId}`, payload);
        return unwrapApiResponse(response);
    },
    deleteUser: async (userId) => {
        const response = await apiClient.delete(`/users/${userId}`);
        return unwrapApiResponse(response);
    },
};
