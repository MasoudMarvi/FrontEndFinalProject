import axios from 'axios';

const api = axios.create({
  baseURL: 'https://localhost:7235/api',
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true // اگه نیاز به کوکی داشتی
});

// 👉 اینجا می‌تونی interceptor اضافه کنی برای JWT
api.interceptors.request.use(config => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;