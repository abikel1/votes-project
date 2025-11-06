import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import http from '../api/http';

const initialToken = localStorage.getItem('token');
const initialUserName = localStorage.getItem('userName');
const initialUserId = localStorage.getItem('userId');
const initialUserEmail = localStorage.getItem('userEmail'); // ✅

export const register = createAsyncThunk('auth/register', async (payload, thunkAPI) => {
  try {
    const { data } = await http.post('/users/register', payload);
    return data;
  } catch (e) {
    return thunkAPI.rejectWithValue(e?.response?.data?.message || 'Registration failed');
  }
});

export const login = createAsyncThunk('auth/login', async (payload, thunkAPI) => {
  try {
    const { data } = await http.post('/users/login', payload);
    return data; // { token, user: { _id, name, email, ... } }
  } catch (e) {
    return thunkAPI.rejectWithValue(e?.response?.data?.message || 'Login failed');
  }
});

export const fetchMe = createAsyncThunk('auth/me', async (_, thunkAPI) => {
  try {
    const { data } = await http.get('/users/me'); // { _id, name, email, ... }
    return data;
  } catch (e) {
    return thunkAPI.rejectWithValue(e?.response?.data?.message || 'Load profile failed');
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    token: initialToken || null,
    userName: initialUserName || null,
    userId: initialUserId || null,
    userEmail: initialUserEmail || null, // ✅
    loading: false,
    error: null,
    registeredOk: false,
  },
  reducers: {
    logout(state) {
      state.token = null;
      state.userName = null;
      state.userId = null;
      state.userEmail = null;
      localStorage.removeItem('token');
      localStorage.removeItem('userName');
      localStorage.removeItem('userId');
      localStorage.removeItem('userEmail');
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(register.pending,  (s) => { s.loading = true; s.error = null; s.registeredOk = false; })
      .addCase(register.fulfilled,(s) => { s.loading = false; s.registeredOk = true; })
      .addCase(register.rejected, (s,a)=> { s.loading = false; s.error = a.payload; })

      .addCase(login.pending,     (s) => { s.loading = true; s.error = null; })
      .addCase(login.fulfilled,   (s,a)=> {
        s.loading = false;
        s.token = a.payload.token;
        s.userName = a.payload.user?.name ?? null;
        s.userId = a.payload.user?._id ?? null;
        s.userEmail = a.payload.user?.email ?? null;
        localStorage.setItem('token', s.token);
        if (s.userName)  localStorage.setItem('userName', s.userName);
        if (s.userId)    localStorage.setItem('userId', s.userId);
        if (s.userEmail) localStorage.setItem('userEmail', s.userEmail);
      })
      .addCase(login.rejected,    (s,a)=> { s.loading = false; s.error = a.payload; })

      .addCase(fetchMe.pending,   (s) => { s.loading = true; s.error = null; })
      .addCase(fetchMe.fulfilled, (s,a)=> {
        s.loading = false;
        s.userName  = a.payload.name  ?? s.userName;
        s.userId    = a.payload._id   ?? s.userId;
        s.userEmail = a.payload.email ?? s.userEmail;
        if (s.userName)  localStorage.setItem('userName', s.userName);
        if (s.userId)    localStorage.setItem('userId', s.userId);
        if (s.userEmail) localStorage.setItem('userEmail', s.userEmail);
      })
      .addCase(fetchMe.rejected,  (s,a)=> { s.loading = false; s.error = a.payload; });
  }
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
