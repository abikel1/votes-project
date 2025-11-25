import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import http from '../api/http';
import i18n from '../i18n';

export const sendMail = createAsyncThunk(
  'mail/send',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await http.post('/mail/send', payload);
      return (
        data?.message ||
        i18n.t('mail.sendSuccess')  // ✔ ברירת מחדל באנגלית/עברית
      );
    } catch (e) {
      return rejectWithValue(
        e?.response?.data?.message ||
        i18n.t('mail.sendFailed')  // ✔ שגיאה מתורגמת
      );
    }
  }
);

const mailSlice = createSlice({
  name: 'mail',
  initialState: {
    status: 'idle',
    error: '',
    lastResponse: null
  },
  reducers: {},
  extraReducers: (b) => {
    b.addCase(sendMail.pending, (s) => {
      s.status = 'loading';
      s.error = '';
    })
      .addCase(sendMail.fulfilled, (s, a) => {
        s.status = 'succeeded';
        s.lastResponse = a.payload; // מחרוזת הודעה
      })
      .addCase(sendMail.rejected, (s, a) => {
        s.status = 'failed';
        s.error = a.payload; // מחרוזת שגיאה
      });
  },
});

export default mailSlice.reducer;
