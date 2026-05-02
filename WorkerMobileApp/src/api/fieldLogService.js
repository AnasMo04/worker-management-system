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
  }
};

export default fieldLogService;
