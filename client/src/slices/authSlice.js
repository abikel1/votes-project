// src/slices/authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import http from '../api/http';

/** ===== עזר: פענוח JWT ללא אימות חתימה (לצורכי UI בלבד) ===== */
function decodeJwtNoVerify(token) {
  try {
    const [, payload] = token.split('.');
    const base = payload.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(escape(atob(base)));
    return JSON.parse(json); // { exp, email?, sub? ... }
  } catch {
    return {};
  }
}

/** ===== ניהול תפוגת טוקן בצד לקוח ===== */

let logoutTimer = null;

function clearAuthStorage() {
  localStorage.removeItem('token');
  localStorage.removeItem('firstName');
  localStorage.removeItem('lastName');
  localStorage.removeItem('userId');
  localStorage.removeItem('userEmail');
  localStorage.removeItem('token_exp');
}

function redirectToExpiredLogin() {
  window.location.href = '/login?expired=1';
}

function scheduleAutoLogout(expUnixSeconds) {
  if (!expUnixSeconds) return;

  const nowMs = Date.now();
  const expMs = expUnixSeconds * 1000;
  const delay = expMs - nowMs;

  if (logoutTimer) {
    clearTimeout(logoutTimer);
    logoutTimer = null;
  }

  // כבר פג
  if (delay <= 0) {
    clearAuthStorage();
    redirectToExpiredLogin();
    return;
  }

  // טיימר לניתוק אוטומטי
  logoutTimer = setTimeout(() => {
    clearAuthStorage();
    redirectToExpiredLogin();
  }, delay);
}

/** ===== קריאה ראשונית מערכי localStorage ===== */

let initialToken = localStorage.getItem('token') || null;
let initialFirstName = localStorage.getItem('firstName') || null;
let initialLastName = localStorage.getItem('lastName') || null;
let initialUserId = localStorage.getItem('userId') || null;
let initialUserEmail = localStorage.getItem('userEmail') || null;
let initialExp = Number(localStorage.getItem('token_exp') || '0');

// אם יש טוקן + exp – נבדוק אם כבר פג
if (initialToken && initialExp) {
  if (initialExp * 1000 <= Date.now()) {
    clearAuthStorage();
    initialToken = null;
    initialFirstName = null;
    initialLastName = null;
    initialUserId = null;
    initialUserEmail = null;
    initialExp = 0;
  } else {
    // עדיין בתוקף – נקבע טיימר לניתוק
    scheduleAutoLogout(initialExp);
  }
}

/** ===== Thunks ===== */

// רישום
export const register = createAsyncThunk(
  'auth/register',
  async (form, thunkAPI) => {
    try {
      const { data } = await http.post('/users/register', form);
      return data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err?.response?.data?.errors || { form: 'אירעה שגיאה ברישום' }
      );
    }
  }
);

// התחברות
export const login = createAsyncThunk(
  'auth/login',
  async (formData, { rejectWithValue }) => {
    try {
      const { data } = await http.post('/users/login', formData);
      return data; // { token, user }
    } catch (err) {
      console.log('--- Frontend error in thunk ---');
      console.log('err:', err);
      console.log('err.response:', err.response);
      console.log('err.response?.data:', err.response?.data);

      if (err.response && err.response.data) {
        return rejectWithValue(
          err.response.data.errors || { form: err.response.data.message }
        );
      }
      return rejectWithValue({ form: err.message });
    }
  }
);

// פרופיל
export const fetchProfile = createAsyncThunk(
  'auth/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await http.get('/users/me');
      return data; // { _id, name, email, ... }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// עדכון פרופיל
export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await http.patch('/users/me', payload);
      return data; // המשתמש המעודכן
    } catch (err) {
      const serverErrors = err?.response?.data?.errors;
      if (serverErrors) {
        return rejectWithValue(serverErrors);
      }
      const msg = err?.response?.data?.message || 'Update profile failed';
      return rejectWithValue({ form: msg });
    }
  }
);

// fetchMe (להשלמת מידע אחרי ריענון)
export const fetchMe = createAsyncThunk(
  'auth/me',
  async (_, thunkAPI) => {
    try {
      const { data } = await http.get('/users/me');
      return data;
    } catch (e) {
      return thunkAPI.rejectWithValue(
        e?.response?.data?.message || 'Load profile failed'
      );
    }
  }
);

// בקשת מייל איפוס
export const requestPasswordReset = createAsyncThunk(
  'auth/requestPasswordReset',
  async (email, { rejectWithValue }) => {
    try {
      const { data } = await http.post('/auth/password/forgot', { email });
      return data?.message || 'אם המייל קיים, נשלחו הוראות לאיפוס.';
    } catch (e) {
      return rejectWithValue(e?.response?.data?.message || 'Request failed');
    }
  }
);

// איפוס בפועל
export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async ({ token, password }, { rejectWithValue }) => {
    try {
      const { data } = await http.post('/auth/password/reset', { token, password });
      return data?.message || 'הסיסמה עודכנה בהצלחה.';
    } catch (e) {
      return rejectWithValue(e?.response?.data?.message || 'Reset failed');
    }
  }
);

export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async ({ currentPassword, newPassword }, { rejectWithValue }) => {
    try {
      const { data } = await http.post('/users/me/password', {
        currentPassword,
        newPassword,
      });
      return data.message || 'הסיסמה עודכנה בהצלחה';
    } catch (err) {
      const serverErrors = err?.response?.data?.errors;
      if (serverErrors) return rejectWithValue(serverErrors);
      const msg = err?.response?.data?.message || 'Change password failed';
      return rejectWithValue({ form: msg });
    }
  }
);

/** ===== Slice ===== */
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    token: initialToken,
    firstName: initialFirstName,
    lastName: initialLastName,
    userId: initialUserId,
    userEmail: initialUserEmail,

    loading: false,
    error: null,
    updateErrors: null,
    registeredOk: false,
    user: null,
    message: '',
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.updateErrors = null;
    },
    clearMessage(state) {
      state.message = null;
    },

    logout(state) {
      state.token = null;
      state.firstName = null;
      state.lastName = null;
      state.userId = null;
      state.userEmail = null;
      state.user = null;
      state.error = null;
      state.updateErrors = null;
      state.message = '';

      if (logoutTimer) {
        clearTimeout(logoutTimer);
        logoutTimer = null;
      }
      clearAuthStorage();
    },

    // משמש בעיקר לחזרה מגוגל OAuth
    loginSuccess(state, action) {
      const { token, user = {} } = action.payload;

      state.token = token;

      const payload = decodeJwtNoVerify(token);

      state.userEmail = user.email ?? payload.email ?? null;
      state.userId =
        user._id ??
        payload.sub ??
        payload.userId ??
        payload.id ??
        null;

      state.firstName = user.firstName ?? payload.firstName ?? state.firstName;
      state.lastName = user.lastName ?? payload.lastName ?? state.lastName;

      localStorage.setItem('token', token);
      if (state.userEmail) localStorage.setItem('userEmail', state.userEmail);
      if (state.userId) localStorage.setItem('userId', state.userId);
      if (state.firstName) localStorage.setItem('firstName', state.firstName);
      if (state.lastName) localStorage.setItem('lastName', state.lastName);

      if (payload.exp) {
        localStorage.setItem('token_exp', String(payload.exp));
        scheduleAutoLogout(payload.exp);
      }
    }
  },
  extraReducers: (builder) => {
    builder
      /** register */
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /** fetchProfile */
      .addCase(fetchProfile.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(fetchProfile.fulfilled, (s, a) => {
        s.loading = false;
        s.user = a.payload;
      })
      .addCase(fetchProfile.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      })

      /** login */
      .addCase(login.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(login.fulfilled, (s, a) => {
        s.loading = false;

        const token = a.payload.token;
        const user = a.payload.user ?? {};

        s.token = token;
        s.user = user;

        s.userId = user._id ?? null;
        s.userEmail = user.email ?? null;
        s.firstName = user.firstName ?? null;
        s.lastName = user.lastName ?? null;

        localStorage.setItem('token', token);
        if (s.firstName) localStorage.setItem('firstName', s.firstName);
        if (s.lastName) localStorage.setItem('lastName', s.lastName);
        if (s.userId) localStorage.setItem('userId', s.userId);
        if (s.userEmail) localStorage.setItem('userEmail', s.userEmail);

        const payload = decodeJwtNoVerify(token);
        if (payload.exp) {
          localStorage.setItem('token_exp', String(payload.exp));
          scheduleAutoLogout(payload.exp);
        }
      })
      .addCase(login.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      })

      /** fetchMe */
      .addCase(fetchMe.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(fetchMe.fulfilled, (s, a) => {
        s.loading = false;
        s.firstName = a.payload.firstName ?? s.firstName;
        s.lastName = a.payload.lastName ?? s.lastName;
        s.userId = a.payload._id ?? s.userId;
        s.userEmail = a.payload.email ?? s.userEmail;

        if (s.firstName) localStorage.setItem('firstName', s.firstName);
        if (s.lastName) localStorage.setItem('lastName', s.lastName);
        if (s.userId) localStorage.setItem('userId', s.userId);
        if (s.userEmail) localStorage.setItem('userEmail', s.userEmail);
      })
      .addCase(fetchMe.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      })

      /** updateProfile */
      .addCase(updateProfile.pending, (s) => {
        s.loading = true;
        s.updateErrors = null;
      })
      .addCase(updateProfile.fulfilled, (s, a) => {
        s.loading = false;
        s.user = a.payload;
        s.updateErrors = null;

        s.firstName = a.payload.firstName ?? s.firstName;
        s.lastName = a.payload.lastName ?? s.lastName;
        s.userEmail = a.payload.email ?? s.userEmail;

        if (s.firstName) localStorage.setItem('firstName', s.firstName);
        if (s.lastName) localStorage.setItem('lastName', s.lastName);
        if (s.userEmail) localStorage.setItem('userEmail', s.userEmail);
      })
      .addCase(updateProfile.rejected, (s, a) => {
        s.loading = false;
        s.updateErrors = a.payload || { form: 'Update profile failed' };
      })

      /** password reset request */
      .addCase(requestPasswordReset.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(requestPasswordReset.fulfilled, (s, a) => {
        s.loading = false;
        s.error = null;
        s.message = a.payload;
      })
      .addCase(requestPasswordReset.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      })

      /** resetPassword */
      .addCase(resetPassword.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(resetPassword.fulfilled, (s, a) => {
        s.loading = false;
        s.error = null;
        s.message = a.payload;
      })
      .addCase(resetPassword.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      })

      /** changePassword */
      .addCase(changePassword.pending, (s) => {
        s.updateErrors = null;
        s.message = '';
      })
      .addCase(changePassword.fulfilled, (s, a) => {
        s.updateErrors = null;
        s.message = a.payload;
      })
      .addCase(changePassword.rejected, (s, a) => {
        s.updateErrors = a.payload || { form: 'Change password failed' };
      });
  }
});

export const { logout, loginSuccess, clearError, clearMessage } = authSlice.actions;
export default authSlice.reducer;
