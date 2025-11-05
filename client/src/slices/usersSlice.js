import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import http from '../api/http';

export const fetchUsers = createAsyncThunk('users/fetchAll', async (_, thunkAPI) => {
    try {
        const { data } = await http.get('/users'); // הראוט שלך שמחזיר את כולם, פתוח ללא טוקן
        return data;
    } catch (e) {
        return thunkAPI.rejectWithValue(e?.response?.data?.message || 'Load users failed');
    }
});

const usersSlice = createSlice({
    name: 'users',
    initialState: { list: [], loading: false, error: null },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchUsers.pending, (s) => { s.loading = true; s.error = null; })
            .addCase(fetchUsers.fulfilled, (s, a) => { s.loading = false; s.list = a.payload; })
            .addCase(fetchUsers.rejected, (s, a) => { s.loading = false; s.error = a.payload; });
    }
});

export default usersSlice.reducer;
