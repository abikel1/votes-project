import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import http from '../api/http';

// POST /groups/:groupId/candidates/:candidateId/vote
export const voteForCandidate = createAsyncThunk(
  'votes/voteForCandidate',
  async ({ groupId, candidateId }, { rejectWithValue }) => {
    try {
      const { data } = await http.post(
        `/votes/groups/${groupId}/candidates/${candidateId}/vote`
      );
      return { groupId, candidateId, data };
    } catch (e) {
      return rejectWithValue(e?.response?.data?.message || 'Vote failed');
    }
  }
);

const slice = createSlice({
  name: 'votes',
  initialState: { status: 'idle', error: null, lastVote: null },
  reducers: { clearVoteError(s){ s.error = null; } },
  extraReducers: (b) => {
    b.addCase(voteForCandidate.pending,   (s)=>{ s.status='loading'; s.error=null; })
     .addCase(voteForCandidate.fulfilled, (s,a)=>{ s.status='succeeded'; s.lastVote=a.payload; })
     .addCase(voteForCandidate.rejected,  (s,a)=>{ s.status='failed'; s.error=a.payload; });
  },
});

export const { clearVoteError } = slice.actions;
export default slice.reducer;
