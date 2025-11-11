import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import http from '../api/http';

// POST /api/votes/create  with body: { userId, groupId, candidateId }
export const voteForCandidate = createAsyncThunk(
  'votes/voteForCandidate',
  async ({ groupId, candidateId }, { getState, rejectWithValue }) => {
    try {
      const userId = getState().auth?.userId;
      if (!userId) return rejectWithValue('User not logged in');

      const { data } = await http.post('/votes/create', { userId, groupId, candidateId });
      return { groupId, candidateId, data };
    } catch (e) {
      return rejectWithValue(e?.response?.data?.message || 'Vote failed');
    }
  }
);


export const checkHasVoted = createAsyncThunk(
  'votes/checkHasVoted',
  async ({ groupId }, { getState, rejectWithValue }) => {
    try {
      const userId = getState().auth?.userId;
      if (!userId) return rejectWithValue(false);

      const { data } = await http.get(`/votes/has-voted?userId=${userId}&groupId=${groupId}`);
      return data.voted;
    } catch (e) {
      return rejectWithValue(false);
    }
  }
);

const slice = createSlice({
  name: 'votes',
  initialState: {
    status: 'idle',
    error: null,
    lastVote: null,
    hasVoted: false, // ✅ שדה חדש
  },
  reducers: {
    clearVoteError(s) { s.error = null; }
  },
  extraReducers: (b) => {
    b.addCase(voteForCandidate.pending, (s) => { s.status = 'loading'; s.error = null; })
      .addCase(voteForCandidate.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.lastVote = action.payload;
        state.hasVoted = true; // ✅ עדכון Redux state במקום setHasVoted
      })
      .addCase(voteForCandidate.rejected, (s, a) => { s.status = 'failed'; s.error = a.payload; })

      .addCase(checkHasVoted.pending, (s) => { s.status = 'loading'; })
      .addCase(checkHasVoted.fulfilled, (s, a) => { s.status = 'succeeded'; s.hasVoted = a.payload; })
      .addCase(checkHasVoted.rejected, (s) => { s.status = 'failed'; s.hasVoted = false; });
  },
});

export const { clearVoteError } = slice.actions;
export default slice.reducer;
