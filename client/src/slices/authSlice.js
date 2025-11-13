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
// export const register = createAsyncThunk(
//   'auth/register',
//   async (payload, thunkAPI) => {
//     try {
//       const { data } = await http.post('/users/register', payload);
//       return data;
//     } catch (e) {
//       return thunkAPI.rejectWithValue(e?.response?.data?.message || 'Registration failed');
//     }
// =======

export const register = createAsyncThunk('auth/register', async (form, thunkAPI) => {
  try {
    const { data } = await http.post('/users/register', form);
    return data;
  } catch (err) {
    // 🔽 זה השינוי הקריטי
    return thunkAPI.rejectWithValue(
      err?.response?.data?.errors || { form: 'אירעה שגיאה ברישום' }
    );
  }
});




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
        return rejectWithValue(err.response.data.errors || { form: err.response.data.message });
      }
      return rejectWithValue({ form: err.message });
    }
  }
);






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

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await http.patch('/users/me', payload); // ← PATCH במקום PUT
      return data; // מחזיר את המשתמש המעודכן
    } catch (e) {
      return rejectWithValue(e?.response?.data?.message || 'Update profile failed');
    }
  }
);

export const fetchMe = createAsyncThunk(
  'auth/me',
  async (_, thunkAPI) => {
    try {
      const { data } = await http.get('/users/me'); // { _id, name, email, ... }
      return data;
    } catch (e) {
      return thunkAPI.rejectWithValue(e?.response?.data?.message || 'Load profile failed');
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
    error: null,
    registeredOk: false,
    user: null,
    message: '',
  },
  reducers: {
  clearError: (state) => {
      state.error = null;
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
    }
    ,
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

      .addCase(fetchProfile.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(fetchProfile.fulfilled, (s, a) => {
        s.loading = false;
        s.user = a.payload;
      })
      .addCase(fetchProfile.rejected, (s, a) => { s.loading = false; s.error = a.payload; })

      // login
      .addCase(login.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(login.fulfilled, (s, a) => {
        s.loading = false;
        s.token = a.payload.token;
        s.userId = a.payload.user?._id ?? null;   // ← חשוב!
        s.userEmail = a.payload.user?.email ?? null;

        localStorage.setItem('token', s.token);
        if (s.firstName) localStorage.setItem('firstName', s.firstName);
        if (s.lastName) localStorage.setItem('lastName', s.lastName);
        s.firstName = a.payload.user?.firstName ?? null;
        s.lastName = a.payload.user?.lastName ?? null;
        s.userId = a.payload.user?._id ?? null;
        s.userEmail = a.payload.user?.email ?? null;

        localStorage.setItem('token', s.token);
        if (s.firstName) localStorage.setItem('firstName', s.firstName);
        if (s.lastName) localStorage.setItem('lastName', s.lastName);
        if (s.userId) localStorage.setItem('userId', s.userId);
        if (s.userEmail) localStorage.setItem('userEmail', s.userEmail);
      })

      .addCase(login.rejected, (s, a) => { s.loading = false; s.error = a.payload; })


      .addCase(fetchMe.pending, (s) => { s.loading = true; s.error = null; })
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

      .addCase(fetchMe.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(updateProfile.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(updateProfile.fulfilled, (s, a) => {
        s.loading = false;
        s.user = a.payload;                               // המשתמש המעודכן
        // שמירה לשדות הנוחים לך ב־state/localStorage (כדי שהאווטאר וכו' יתעדכן מיד)
        s.firstName = a.payload.firstName ?? s.firstName;
        s.lastName = a.payload.lastName ?? s.lastName;
        s.userEmail = a.payload.email ?? s.userEmail;

        if (s.firstName) localStorage.setItem('firstName', s.firstName);
        if (s.lastName) localStorage.setItem('lastName', s.lastName);
        if (s.userEmail) localStorage.setItem('userEmail', s.userEmail);
      })
      .addCase(updateProfile.rejected, (s, a) => { s.loading = false; s.error = a.payload; })

      .addCase(requestPasswordReset.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(requestPasswordReset.fulfilled, (s, a) => { s.loading = false; s.error = null; s.message = a.payload; })
      .addCase(requestPasswordReset.rejected, (s, a) => { s.loading = false; s.error = a.payload; })

      .addCase(resetPassword.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(resetPassword.fulfilled, (s, a) => { s.loading = false; s.error = null; s.message = a.payload; })
      .addCase(resetPassword.rejected, (s, a) => { s.loading = false; s.error = a.payload; });
  }
});

export const { logout, loginSuccess ,clearError } = authSlice.actions;
export default authSlice.reducer;
