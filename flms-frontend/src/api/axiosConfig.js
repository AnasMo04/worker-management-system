import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'; 

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 🛡️ إضافة "مفتش" (Interceptor) يرفق التوكن مع أي طلب طالع للسيرفر
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    // لو التوكن موجود في المتصفح، ضيفه في الهيدر (Header) بتاع الطلب
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;