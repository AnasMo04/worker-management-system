import axios from 'axios';

// قراءة رابط السيرفر من ملف البيئة (عدلها حسب اللي تستخدم فيه Vite أو CRA)
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'; 

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosInstance;