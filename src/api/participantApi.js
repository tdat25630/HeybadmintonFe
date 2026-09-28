import apiClient, { unwrapApiResponse } from './apiClient';

export const participantApi = {
    getParticipants: async (sessionId, page = 0, size = 10) => {
        const response = await apiClient.get('/sessionParticipants', { params: { sessionId, page, size } });
        return unwrapApiResponse(response);
    },
    addMember: async (payload) => {
        const response = await apiClient.post('/sessionParticipants', payload);
        return unwrapApiResponse(response);
    },
    addGuest: async (payload) => {
        const response = await apiClient.post('/sessionParticipants/addGuess', payload);
        return unwrapApiResponse(response);
    },
    deleteParticipant: async (sessionId, participantId) => {
        const response = await apiClient.delete('/sessionParticipants', {
            params: { sessionId, participantId },
        });
        return unwrapApiResponse(response);
    },
};
