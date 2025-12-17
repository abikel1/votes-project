// src/api/http.js
import axios from 'axios';

const http = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
    withCredentials: true,
    validateStatus: (status) => status >= 200 && status < 400,
});



// =============================
//   בדיקת תפוגת טוקן בצד לקוח
// =============================

let tokenExpiredHandled = false;

// פענוח exp מה-JWT בלי escape/decodeURIComponent ועם padding תקין
function decodeJwtExp(token) {
    try {
        const parts = token.split('.');
        if (parts.length < 2) return null;

        let base = parts[1].replace(/-/g, '+').replace(/_/g, '/');
        // הוספת padding אם חסר
        while (base.length % 4 !== 0) {
            base += '=';
        }

        const json = atob(base);
        const data = JSON.parse(json); // { exp, ... }

        return typeof data.exp === 'number' ? data.exp : null;
    } catch (e) {
        console.warn('decodeJwtExp failed:', e);
        return null;
    }
}

function handleTokenExpired() {
    if (tokenExpiredHandled) return;
    tokenExpiredHandled = true;

    // ניקוי כל הנתונים מה־localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('firstName');
    localStorage.removeItem('lastName');
    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('token_exp');

    // מעבר לדף התחברות עם פרמטר expired=1
    window.location.href = '/login?expired=1';
}

function checkTokenExpiry() {
    const token = localStorage.getItem('token');
    if (!token) return;

    const exp = decodeJwtExp(token);
    if (!exp) return;

    const nowMs = Date.now();
    const expMs = exp * 1000;

    // אם כבר עברנו את זמן התפוגה → התנתקות
    if (expMs <= nowMs) {
        handleTokenExpired();
    }
}

// בדיקה מיידית כשנטען הקובץ (למקרה שרעננו אחרי שפג התוקף)
checkTokenExpiry();

// בדיקה כל 5 שניות
setInterval(checkTokenExpiry, 5000);

// =============================
//   Interceptor לבקשות
// =============================

http.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default http;
