import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import http from '../api/http';

// אתחול טוקן מה-localStorage
const initialToken = localStorage.getItem('token');

export const register = createAsyncThunk('auth/register', async (payload, thunkAPI) => {
    try {
        const { data } = await http.post('/users/register', payload);
        return data; // לא שומר טוקן בהרשמה
    } catch (e) {
        return thunkAPI.rejectWithValue(e?.response?.data?.message || 'Registration failed');
    }
});

export const login = createAsyncThunk('auth/login', async (payload, thunkAPI) => {
    try {
        const { data } = await http.post('/users/login', payload);
        return data; // { token, user }
    } catch (e) {
        return thunkAPI.rejectWithValue(e?.response?.data?.message || 'Login failed');
    }
});

export const fetchMe = createAsyncThunk('auth/me', async (_, thunkAPI) => {
    try {
        const { data } = await http.get('/users/me');
        return data; // user
    } catch (e) {
        return thunkAPI.rejectWithValue(e?.response?.data?.message || 'Load profile failed');
    }
});

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        token: initialToken || null,
        user: null,
        loading: false,
        error: null,
        registeredOk: false,
    },
    reducers: {
        logout(state) {
            state.token = null;
            state.user = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // register
            .addCase(register.pending, (s) => { s.loading = true; s.error = null; s.registeredOk = false; })
            .addCase(register.fulfilled, (s) => { s.loading = false; s.registeredOk = true; })
            .addCase(register.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
            // login
            .addCase(login.pending, (s) => { s.loading = true; s.error = null; })
            .addCase(login.fulfilled, (s, a) => {
                s.loading = false;
                s.token = a.payload.token;
                s.user = a.payload.user ?? s.user;
            })
            .addCase(login.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
            // me
            .addCase(fetchMe.pending, (s) => { s.loading = true; s.error = null; })
            .addCase(fetchMe.fulfilled, (s, a) => { s.loading = false; s.user = a.payload; })
            .addCase(fetchMe.rejected, (s, a) => { s.loading = false; s.error = a.payload; });
    }
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
