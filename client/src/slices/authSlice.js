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
  } catch (e) {
    return thunkAPI.rejectWithValue(e?.response?.data?.message || 'Registration failed');
    // >>>>>>> a1c83c8d2145ebf88aa769ba8d04af15a79010c3
  }
});


export const login = createAsyncThunk(
  'auth/login',
  async (formData, { rejectWithValue }) => {
    try {
      const { data } = await http.post('/users/login', formData); // { token, user? }
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
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
  },
  reducers: {
    // <<<<<<< HEAD
    //     logout(state) {
    //       state.token = null;
    //       state.userName = null;
    //       state.userId = null;
    //       state.userEmail = null;
    //       state.user = null;
    //       localStorage.removeItem('token');
    //       localStorage.removeItem('userName');
    //       localStorage.removeItem('userId');
    //       localStorage.removeItem('userEmail');
    //     }
    // =======
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
      /** register */
      .addCase(register.pending, (s) => { s.loading = true; s.error = null; s.registeredOk = false; })
      .addCase(register.fulfilled, (s) => { s.loading = false; s.registeredOk = true; })
      .addCase(register.rejected, (s, a) => { s.loading = false; s.error = a.payload; })

      // /** fetchProfile */
      // .addCase(fetchProfile.pending,   (s)=>{ s.loading=true; s.error=null; })
      // .addCase(fetchProfile.fulfilled, (s,a)=>{ s.loading=false; s.user=a.payload; })
      // .addCase(fetchProfile.rejected,  (s,a)=>{ s.loading=false; s.error=a.payload; })

      // <<<<<<< HEAD
      //       /** login */
      //       .addCase(login.pending,   (s)=>{ s.loading=true; s.error=null; })
      //       .addCase(login.fulfilled, (s,a)=>{
      //         s.loading = false;
      //         s.token   = a.payload.token;
      //         // שם מהשרת אם הגיע
      //         s.userName = a.payload.user?.name ?? s.userName;

      //         // ⭐️ פענוח JWT לצורך userId/userEmail מיידיים (כדי לחשב בעלות קבוצות ולראות ⚙️)
      //         const p = decodeJwtNoVerify(a.payload.token);
      //         s.userId    = p._id || p.id || p.userId || p.dbId || p.sub || s.userId || null;
      //         s.userEmail = p.email || p.user?.email || s.userEmail || null;

      //         localStorage.setItem('token', s.token);
      //         if (s.userName)  localStorage.setItem('userName', s.userName);
      //         if (s.userId)    localStorage.setItem('userId', s.userId);
      //         if (s.userEmail) localStorage.setItem('userEmail', s.userEmail);
      //       })
      //       .addCase(login.rejected,  (s,a)=>{ s.loading=false; s.error=a.payload; })

      //       /** fetchMe */
      //       .addCase(fetchMe.pending,   (s)=>{ s.loading=true; s.error=null; })
      //       .addCase(fetchMe.fulfilled, (s,a)=>{
      //         s.loading = false;
      //         s.userName  = a.payload.name  ?? s.userName;
      //         s.userId    = a.payload._id   ?? s.userId;
      //         s.userEmail = a.payload.email ?? s.userEmail;
      //         if (s.userName)  localStorage.setItem('userName', s.userName);
      //         if (s.userId)    localStorage.setItem('userId', s.userId);
      //         if (s.userEmail) localStorage.setItem('userEmail', s.userEmail);
      //       })
      //       .addCase(fetchMe.rejected,  (s,a)=>{ s.loading=false; s.error=a.payload; });
      // =======

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
      .addCase(updateProfile.rejected, (s, a) => { s.loading = false; s.error = a.payload; });
  }
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
