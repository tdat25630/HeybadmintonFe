import apiClient, { unwrapApiResponse } from './apiClient';

export const roleApi = {
    getRoles: async () => {
        const response = await apiClient.get('/roles');
        return unwrapApiResponse(response);
    },
    createRole: async (payload) => {
        const response = await apiClient.post('/roles', payload);
        return unwrapApiResponse(response);
    },
    deleteRole: async (roleName) => {
        const response = await apiClient.delete(`/roles/${roleName}`);
        return unwrapApiResponse(response);
    },
};
