// client/src/api/http.js
import axios from 'axios';

const http = axios.create({
    baseURL: '/api',              // ⚠️ ודאי שזה ה־prefix של השרת שלך
    withCredentials: true,        // אם את משתמשת גם בעוגיות
});

// הזרקת Authorization לכל בקשה
http.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');  // את שומרת אותו ב־authSlice
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default http;
