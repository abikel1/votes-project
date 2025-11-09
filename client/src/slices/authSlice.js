import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import http from '../api/http'; // כאן נמצא axios instance שלך

const initialToken = localStorage.getItem('token');
const initialFirstName = localStorage.getItem('firstName');
const initialLastName = localStorage.getItem('lastName');

export const register = createAsyncThunk('auth/register', async (form, thunkAPI) => {
  try {
    const { data } = await http.post('/users/register', form);
    return data;
  } catch (e) {
    return thunkAPI.rejectWithValue(e?.response?.data?.message || 'Registration failed');
  }
});


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
    firstName: initialFirstName || null,
    lastName: initialLastName || null,
    userId: localStorage.getItem('userId') || null,
    userEmail: localStorage.getItem('userEmail') || null,
    loading: false,
    error: null,
    registeredOk: false,
  },
  reducers: {
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

      .addCase(fetchMe.rejected, (s, a) => { s.loading = false; s.error = a.payload; });

  }
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
