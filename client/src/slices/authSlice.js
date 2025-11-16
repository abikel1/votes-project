import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import http from '../api/http';

// <<<<<<< HEAD
/** ===== עזר: פענוח JWT ללא אימות חתימה (לצורכי UI בלבד) ===== */
function decodeJwtNoVerify(token) {
  try {
    const [, payload] = token.split('.');
    const base = payload.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(escape(atob(base)));
    return JSON.parse(json); // { email?, name?, _id/id/userId/dbId/sub? ... }
  } catch {
    return {};
  }
}

/** ===== קריאה ראשונית מערכי localStorage ===== */
const initialToken = localStorage.getItem('token');
const initialUserId = localStorage.getItem('userId');      // ← חדש
const initialUserEmail = localStorage.getItem('userEmail');   // ← אופציונלי
const initialFirstName = localStorage.getItem('firstName');
const initialLastName = localStorage.getItem('lastName');

/** ===== Thunks ===== */

// רישום
export const register = createAsyncThunk(
  'auth/register',
  async (form, thunkAPI) => {
    try {
      const { data } = await http.post('/users/register', form);
      return data;
    } catch (err) {
      // השרת מחזיר { errors: {...} }
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
      return data;
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

// עדכון פרופיל (כולל טיפול בשגיאת אימייל כפול)
export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await http.patch('/users/me', payload);
      return data; // המשתמש המעודכן
    } catch (err) {
      const serverErrors = err?.response?.data?.errors;
      if (serverErrors) {
        // למשל { email: 'המייל כבר קיים במערכת' }
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
      const { data } = await http.get('/users/me'); // { _id, name, email, ... }
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
    token: localStorage.getItem('token') || null,
    firstName: localStorage.getItem('firstName') || null,
    lastName: localStorage.getItem('lastName') || null,
    userId: localStorage.getItem('userId') || null,
    userEmail: localStorage.getItem('userEmail') || null,

    loading: false,
    error: null,          // שגיאות כלליות (לוגין/רישום וכו')
    updateErrors: null,   // 👈 שגיאות של עדכון פרופיל
    registeredOk: false,
    user: null,
    message: '',
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.updateErrors = null;
    },

    logout(state) {
      state.token = null;
      state.firstName = null;
      state.lastName = null;
      state.userId = null;
      state.userEmail = null;

      localStorage.removeItem('token');
      localStorage.removeItem('firstName');
      localStorage.removeItem('lastName');
      localStorage.removeItem('userId');
      localStorage.removeItem('userEmail');
    },

    loginSuccess(state, action) {
      const { token, user } = action.payload;

      state.token = token;
      state.userEmail = user?.email ?? null;
      state.userId = user?._id ?? null;

      localStorage.setItem('token', token);
      if (state.userEmail) localStorage.setItem('userEmail', state.userEmail);
      if (state.userId) localStorage.setItem('userId', state.userId);
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
        s.token = a.payload.token;
        s.userId = a.payload.user?._id ?? null;
        s.userEmail = a.payload.user?.email ?? null;

        s.firstName = a.payload.user?.firstName ?? null;
        s.lastName = a.payload.user?.lastName ?? null;

        localStorage.setItem('token', s.token);
        if (s.firstName) localStorage.setItem('firstName', s.firstName);
        if (s.lastName) localStorage.setItem('lastName', s.lastName);
        if (s.userId) localStorage.setItem('userId', s.userId);
        if (s.userEmail) localStorage.setItem('userEmail', s.userEmail);
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
        s.user = a.payload; // המשתמש המעודכן
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
      // שינוי סיסמה
      .addCase(changePassword.pending, (s) => {
        // לא נוגעים ב-loading כדי שהעמוד לא "יטען מחדש"
        s.updateErrors = null;   // ✅ לנקות שגיאות קודמות מהשרת
        s.message = '';
      })
      .addCase(changePassword.fulfilled, (s, a) => {
        s.updateErrors = null;
        s.message = a.payload;   // 'הסיסמה עודכנה בהצלחה.'
      })
      .addCase(changePassword.rejected, (s, a) => {
        s.updateErrors = a.payload || { form: 'Change password failed' };
      })


  }
});

export const { logout, loginSuccess, clearError } = authSlice.actions;
export default authSlice.reducer;
