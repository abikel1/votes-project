import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import http from '../api/http'; // כאן נמצא axios instance שלך

const initialToken = localStorage.getItem('token');
const initialUserName = localStorage.getItem('userName');

export const register = createAsyncThunk(
  'auth/register',
  async (payload, thunkAPI) => {
    try {
      const { data } = await http.post('/users/register', payload);
      return data;
    } catch (e) {
      return thunkAPI.rejectWithValue(e?.response?.data?.message || 'Registration failed');
    }
  }
);

export const login = createAsyncThunk(
  'auth/login',
  async (formData, { rejectWithValue }) => {
    try {
      const { data } = await http.post('/users/login', formData); // שולח בקשה לשרת
      return data; // מחזיר { token, user }
    } catch (err) {
      // כאן נשלח את הודעת השגיאה המדויקת מהשרת
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// authSlice.js
export const fetchProfile = createAsyncThunk(
  'auth/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await http.get('/users/me'); // ראוט שמחזיר את המשתמש הנוכחי לפי token
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const updateProfile = createAsyncThunk('auth/updateProfile', async (payload, thunkAPI) => {
  try {
    const { data } = await http.put('/users/me', payload); // PUT עדכון פרופיל
    return data;
  } catch (e) {
    return thunkAPI.rejectWithValue(e?.response?.data?.message || 'Update profile failed');
  }
});


const authSlice = createSlice({
  name: 'auth',
  initialState: {
    token: initialToken || null,
    userName: initialUserName || null,
    loading: false,
    error: null,
    registeredOk: false,
  },
  reducers: {
    logout(state) {
      state.token = null;
      state.userName = null;
      localStorage.removeItem('token');
      localStorage.removeItem('userName');
    }
  },
  extraReducers: (builder) => {
    builder
      // register
      .addCase(register.pending, (s) => { s.loading = true; s.error = null; s.registeredOk = false; })
      .addCase(register.fulfilled, (s) => { s.loading = false; s.registeredOk = true; })
      .addCase(register.rejected, (s, a) => { s.loading = false; s.error = a.payload; })



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
        s.userName = a.payload.user?.name ?? null;
        localStorage.setItem('token', s.token);
        if (s.userName) localStorage.setItem('userName', s.userName);
      })
      .addCase(login.rejected, (s, a) => { s.loading = false; s.error = a.payload; });
  }
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
