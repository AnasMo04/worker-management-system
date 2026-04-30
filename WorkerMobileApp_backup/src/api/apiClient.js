import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Replace with your machine's local IP address for real device testing
// 'http://10.0.2.2:3000' is the default for Android Emulator to host machine
const BASE_URL = 'http://192.168.11.230:5000';

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add JWT token to requests
apiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;
export { BASE_URL };
