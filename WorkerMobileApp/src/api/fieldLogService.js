import apiClient from './apiClient';

const fieldLogService = {
  logInspection: async (data) => {
    try {
      const response = await apiClient.post('/api/field-logs/log', data);
      return response.data;
    } catch (error) {
      console.error('Log Inspection Error:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  getMyLogs: async () => {
    try {
      const response = await apiClient.get('/api/field-logs/my-logs');
      return response.data;
    } catch (error) {
      console.error('Get My Logs Error:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  }
};

export default fieldLogService;
