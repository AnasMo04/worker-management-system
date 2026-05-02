import apiClient from './apiClient';

const dashboardService = {
  getSummary: async () => {
    try {
      const response = await apiClient.get('/api/dashboard/officer');
      return response.data;
    } catch (error) {
      console.error('Get Dashboard Summary Error:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  }
};

export default dashboardService;
