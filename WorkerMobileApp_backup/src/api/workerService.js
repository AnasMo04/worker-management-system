import apiClient from './apiClient';

const workerService = {
  getAllWorkers: async (params = {}) => {
    try {
      const response = await apiClient.get('/api/workers', { params });
      return response.data;
    } catch (error) {
      console.error('Get Workers Error:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  getWorkerById: async (id) => {
    try {
      const response = await apiClient.get(`/api/workers/${id}`);
      return response.data;
    } catch (error) {
      console.error('Get Worker Details Error:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  searchByNfcUid: async (nfcUid) => {
    try {
      const response = await apiClient.get(`/api/workers/nfc/${nfcUid}`);
      return response.data;
    } catch (error) {
      console.error('NFC Search Error:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  }
};

export default workerService;
