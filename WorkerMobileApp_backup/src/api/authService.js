import apiClient from './apiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const authService = {
  login: async (username, password) => {
    try {
      const response = await apiClient.post('/api/auth/login', {
        username,
        password,
      });

      if (response.data.token) {
        await AsyncStorage.setItem('userToken', response.data.token);
        await AsyncStorage.setItem('userData', JSON.stringify(response.data.user));
      }

      return response.data;
    } catch (error) {
      console.error('Login Error:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  logout: async () => {
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('userData');
  },

  getCurrentUser: async () => {
    const userData = await AsyncStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  },

  getToken: async () => {
    return await AsyncStorage.getItem('userToken');
  }
};

export default authService;
