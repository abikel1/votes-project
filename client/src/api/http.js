import axios from 'axios';

const http = axios.create({
    baseURL: '/api', // אם אין proxy ל-/api: החליפי ל- 'http://localhost:3000/api'
    withCredentials: true,
});

// הזרקת Authorization לכל בקשה
http.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

export default http;
