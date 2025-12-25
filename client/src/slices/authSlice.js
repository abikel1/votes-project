import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import http from '../api/http';
import i18n from '../i18n';

function decodeJwtNoVerify(token) {
  try {
    const [, payload] = token.split('.');
    const base = payload.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(escape(atob(base)));
    return JSON.parse(json);
  } catch {
    return {};
  }
}

let logoutTimer = null;

function clearAuthStorage() {
  localStorage.removeItem('token');
  localStorage.removeItem('firstName');
  localStorage.removeItem('lastName');
  localStorage.removeItem('userId');
  localStorage.removeItem('userEmail');
  localStorage.removeItem('token_exp');
  localStorage.removeItem('isAdmin');
}

function redirectToExpiredLogin() {
  window.location.href = '/login?expired=1';
}

function scheduleAutoLogout(expUnixSeconds) {
  if (!expUnixSeconds) return;

  const nowMs = Date.now();
  const expMs = expUnixSeconds * 1000;
  const delay = expMs - nowMs;

  if (logoutTimer) clearTimeout(logoutTimer);

  if (delay <= 0) {
    clearAuthStorage();
    redirectToExpiredLogin();
    return;
  }

  logoutTimer = setTimeout(() => {
    clearAuthStorage();
    redirectToExpiredLogin();
  }, delay);
}

const initialToken = localStorage.getItem('token');
const initialUserEmail = localStorage.getItem('userEmail');
const initialUserId = localStorage.getItem('userId');
const initialFirstName = localStorage.getItem('firstName');
const initialLastName = localStorage.getItem('lastName');
const initialExp = Number(localStorage.getItem('token_exp') || 0);
const initialIsAdmin = localStorage.getItem('isAdmin') === '1';

if (initialToken && initialExp * 1000 <= Date.now()) {
  clearAuthStorage();
}

export const register = createAsyncThunk(
  'auth/register',
  async (form, thunkAPI) => {
    try {
      const { data } = await http.post('/users/register', form);
      return data;
    } catch (err) {
      return thunkAPI.rejectWithValue({
        form: i18n.t('auth.register.genericError'),
      }
      );
    }
  }
);

export const fetchProfile = createAsyncThunk(
  'auth/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await http.get('/users/me');
      return data;
    } catch (err) {
      return rejectWithValue(i18n.t('auth.profile.loadFailed'));
    }
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await http.patch('/users/me', payload);
      return data;
    } catch (err) {
      const serverErrors = err?.response?.data?.errors;
      if (serverErrors) {
        return rejectWithValue(serverErrors);
      }
      const msg = i18n.t('auth.profile.updateFailed');
      return rejectWithValue({ form: msg });
    }
  }
);

export const login = createAsyncThunk(
  'auth/login',
  async (formData, { rejectWithValue }) => {
    try {
      const { data } = await http.post('/users/login', formData);
      return data;
    } catch (err) {
      const errors = err?.response?.data?.errors;

      if (errors) {
        const translated = {};

        if (errors.email === 'EMAIL_NOT_FOUND') {
          translated.email = i18n.t('auth.login.errors.emailNotFound');
        } else if (typeof errors.email === 'string') {
          translated.email = errors.email;
        }
        if (errors.password === 'INVALID_PASSWORD') {
          translated.password = i18n.t('auth.login.errors.invalidPassword');
        } else if (typeof errors.password === 'string') {
          translated.password = errors.password;
        }
        return rejectWithValue(translated);
      }
      return rejectWithValue({ form: i18n.t('auth.serverError') });
    }
  }
);

export const fetchMe = createAsyncThunk('auth/me', async (_, { rejectWithValue }) => {
  try {
    const { data } = await http.get('/users/me');
    return data;
  } catch (err) {
    return rejectWithValue(i18n.t('auth.profile.loadFailed'));
  }
});

export const requestPasswordReset = createAsyncThunk(
  'auth/requestPasswordReset',
  async (email, { rejectWithValue }) => {
    try {
      const { data } = await http.post('/auth/password/forgot', { email });
      return i18n.t('auth.forgot.genericSuccess');
    } catch (e) {
      return rejectWithValue(i18n.t('auth.forgot.genericError'));
    }
  }
);

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async ({ token, password }, { rejectWithValue }) => {
    try {
      const { data } = await http.post('/auth/password/reset', { token, password });
      return i18n.t('auth.reset.genericSuccess');
    } catch (e) {
      return rejectWithValue(i18n.t('auth.reset.genericError')
      );
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
      return i18n.t('auth.changePassword.genericSuccess');
    } catch (err) {
      const serverErrors = err?.response?.data?.errors;
      if (serverErrors) return rejectWithValue(serverErrors);
      const msg = i18n.t('auth.changePassword.genericError');
      return rejectWithValue({ form: msg });
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    token: initialToken,
    firstName: initialFirstName,
    lastName: initialLastName,
    userId: initialUserId,
    userEmail: initialUserEmail,
    isAdmin: initialIsAdmin,
    loading: false,
    forgotLoading: false,
    error: null,
    user: null,
    message: '',
    updateErrors: null,
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
      state.message = '';
      state.isAdmin = false;

      if (logoutTimer) clearTimeout(logoutTimer);
      clearAuthStorage();
    },

    loginSuccess(state, action) {
      const { token, user = {} } = action.payload;
      state.token = token;

      const payload = decodeJwtNoVerify(token);

      state.userEmail = user.email ?? payload.email ?? null;
      state.userId = user._id ?? payload.sub ?? payload.userId ?? payload.id ?? null;
      state.firstName = user.firstName ?? payload.firstName ?? state.firstName;
      state.lastName = user.lastName ?? payload.lastName ?? state.lastName;
      state.isAdmin = !!user.isAdmin;

      localStorage.setItem('token', token);
      if (state.userEmail) localStorage.setItem('userEmail', state.userEmail);
      if (state.userId) localStorage.setItem('userId', state.userId);
      if (state.firstName) localStorage.setItem('firstName', state.firstName);
      if (state.lastName) localStorage.setItem('lastName', state.lastName);
      localStorage.setItem('isAdmin', state.isAdmin ? '1' : '0');

      if (payload.exp) {
        localStorage.setItem('token_exp', String(payload.exp));
        scheduleAutoLogout(payload.exp);
      }
    },
  },
  extraReducers: (builder) => {
    builder
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
      .addCase(login.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(login.fulfilled, (s, a) => {
        s.loading = false;
        s.token = a.payload.token;
        s.user = a.payload.user ?? {};
        const user = s.user;

        s.userId = user._id ?? null;
        s.userEmail = user.email ?? null;
        s.firstName = user.firstName ?? null;
        s.lastName = user.lastName ?? null;
        s.isAdmin = !!user.isAdmin;

        localStorage.setItem('token', s.token);
        if (s.firstName) localStorage.setItem('firstName', s.firstName);
        if (s.lastName) localStorage.setItem('lastName', s.lastName);
        if (s.userId) localStorage.setItem('userId', s.userId);
        if (s.userEmail) localStorage.setItem('userEmail', s.userEmail);
        localStorage.setItem('isAdmin', s.isAdmin ? '1' : '0');

        const payload = decodeJwtNoVerify(s.token);
        if (payload.exp) {
          localStorage.setItem('token_exp', String(payload.exp));
          scheduleAutoLogout(payload.exp);
        }
      })
      .addCase(login.rejected, (s, a) => { s.loading = false; s.error = a.payload; })

      .addCase(fetchMe.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(fetchMe.fulfilled, (s, a) => {
        s.loading = false;
        s.firstName = a.payload.firstName ?? s.firstName;
        s.lastName = a.payload.lastName ?? s.lastName;
        s.userId = a.payload._id ?? s.userId;
        s.userEmail = a.payload.email ?? s.userEmail;
        s.isAdmin = a.payload.isAdmin ?? s.isAdmin;

        if (s.firstName) localStorage.setItem('firstName', s.firstName);
        if (s.lastName) localStorage.setItem('lastName', s.lastName);
        if (s.userId) localStorage.setItem('userId', s.userId);
        if (s.userEmail) localStorage.setItem('userEmail', s.userEmail);
        localStorage.setItem('isAdmin', s.isAdmin ? '1' : '0');
      })
      .addCase(fetchMe.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
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
        if (typeof a.payload.isAdmin !== 'undefined') {
          s.isAdmin = !!a.payload.isAdmin;
        }

        if (s.firstName) localStorage.setItem('firstName', s.firstName);
        if (s.lastName) localStorage.setItem('lastName', s.lastName);
        if (s.userEmail) localStorage.setItem('userEmail', s.userEmail);
        localStorage.setItem('isAdmin', s.isAdmin ? '1' : '0');
      })
      .addCase(updateProfile.rejected, (s, a) => {
        s.loading = false;
        s.updateErrors = { form: i18n.t('auth.profile.updateFailed') };
      })
      .addCase(requestPasswordReset.pending, (s) => {
        s.forgotLoading = true;   // ✅
        s.error = null;
      })
      .addCase(requestPasswordReset.fulfilled, (s, a) => {
        s.forgotLoading = false;  // ✅
        s.error = null;
        s.message = a.payload;
      })
      .addCase(requestPasswordReset.rejected, (s, a) => {
        s.forgotLoading = false;  // ✅
        s.error = a.payload;
      })
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

      .addCase(changePassword.pending, (s) => {
        s.updateErrors = null;
        s.message = '';
      })
      .addCase(changePassword.fulfilled, (s, a) => {
        s.updateErrors = null;
        s.message = a.payload;
      })
      .addCase(changePassword.rejected, (s, a) => {
        s.updateErrors = a.payload || { form: i18n.t('auth.changePassword.genericError') };
      });

  }
});

export const { logout, loginSuccess, clearError, clearMessage } = authSlice.actions;
export default authSlice.reducer;
export const selectUser = (state) => state.auth.user;
export const selectUserId = (state) => state.auth.userId;
