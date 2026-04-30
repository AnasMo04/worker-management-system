import apiClient from './apiClient';

const workerService = {
  getAllWorkers: async (params = {}) => {
    try {
      // Safe: passing params object
      const response = await apiClient.get('/api/workers', { params });
      return response.data;
    } catch (error) {
      console.error('Get Workers Error:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  getWorkerById: async (id) => {
    try {
      // Path parameters are generally safe if properly encoded by axios,
      // but for enterprise grade we ensure it's not a complex object
      const response = await apiClient.get(`/api/workers/${encodeURIComponent(id)}`);
      return response.data;
    } catch (error) {
      console.error('Get Worker Details Error:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  searchByNfcUid: async (nfcUid) => {
    try {
      // Safe: passing as a query parameter or ensuring path is encoded
      const response = await apiClient.get(`/api/workers/nfc/${encodeURIComponent(nfcUid)}`);
      return response.data;
    } catch (error) {
      console.error('NFC Search Error:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  }
};

export default workerService;
