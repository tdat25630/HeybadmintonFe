import apiClient, { unwrapApiResponse } from './apiClient';

export const permissionApi = {
    getPermissions: async () => {
        const response = await apiClient.get('/permissions');
        return unwrapApiResponse(response);
    },
    createPermission: async (payload) => {
        const response = await apiClient.post('/permissions', payload);
        return unwrapApiResponse(response);
    },
    deletePermission: async (permissionName) => {
        const response = await apiClient.delete(`/permissions/${permissionName}`);
        return unwrapApiResponse(response);
    },
};
