import axios from 'axios';

const http = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
    withCredentials: true,
    validateStatus: (status) => status >= 200 && status < 400,
});

let tokenExpiredHandled = false;

function decodeJwtExp(token) {
    try {
        const parts = token.split('.');
        if (parts.length < 2) return null;

        let base = parts[1].replace(/-/g, '+').replace(/_/g, '/');
        while (base.length % 4 !== 0) {
            base += '=';
        }

        const json = atob(base);
        const data = JSON.parse(json);

        return typeof data.exp === 'number' ? data.exp : null;
    } catch (e) {
        console.warn('decodeJwtExp failed:', e);
        return null;
    }
}

function handleTokenExpired() {
    if (tokenExpiredHandled) return;
    tokenExpiredHandled = true;

    localStorage.removeItem('token');
    localStorage.removeItem('firstName');
    localStorage.removeItem('lastName');
    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('token_exp');

    window.location.href = '/login?expired=1';
}

function checkTokenExpiry() {
    const token = localStorage.getItem('token');
    if (!token) return;

    const exp = decodeJwtExp(token);
    if (!exp) return;

    const nowMs = Date.now();
    const expMs = exp * 1000;

    if (expMs <= nowMs) {
        handleTokenExpired();
    }
}

checkTokenExpiry();

setInterval(checkTokenExpiry, 5000);

http.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default http;
