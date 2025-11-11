import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import http from '../api/http';

/**
 * הצבעה למועמד/ת
 * POST /votes/create  body: { userId, groupId, candidateId }
 */
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

/**
 * ← חדש: מצביעים לפי קבוצה
 * שימי לב: עדכני את ה-URL אם השרת שלך שונה.
 * דוגמאות נפוצות:
 *   /votes/group/:groupId/voters
 *   /votes/voters?groupId=...
 */
export const fetchVotersByGroup = createAsyncThunk(
  'votes/fetchVotersByGroup',
  async (groupId, { rejectWithValue }) => {
    try {
      const { data } = await http.get(`/votes/group/${groupId}/voters`);
      // מצופה מערך של מצביעים עם שדות כמו: _id/userId, name/email, votedAt...
      return { groupId, voters: Array.isArray(data) ? data : (data?.voters || []) };
    } catch (e) {
      return rejectWithValue({
        groupId,
        message: e?.response?.data?.message || 'Failed to fetch voters'
      });
    }
  }
);

const initialState = {
  status: 'idle',
  error: null,
  lastVote: null,

  // ← חדש: אחסון פר-קבוצה
  votersByGroup: {},          // { [groupId]: array }
  votersLoadingByGroup: {},   // { [groupId]: boolean }
  votersErrorByGroup: {},     // { [groupId]: string|null }
};

const slice = createSlice({
  name: 'votes',
  initialState,
  reducers: {
    clearVoteError(state) { state.error = null; },
    // אופציונלי: איפוס שגיאה של מצביעים לקבוצה
    clearVotersErrorForGroup(state, action) {
      const gid = String(action.payload);
      if (gid) state.votersErrorByGroup[gid] = null;
    },
  },
  extraReducers: (b) => {
    // הצבעה
    b.addCase(voteForCandidate.pending, (s) => { s.status = 'loading'; s.error = null; })
      .addCase(voteForCandidate.fulfilled, (s, a) => { s.status = 'succeeded'; s.lastVote = a.payload; })
      .addCase(voteForCandidate.rejected, (s, a) => { s.status = 'failed'; s.error = a.payload; });

    // מצביעים
    b.addCase(fetchVotersByGroup.pending, (s, a) => {
      const gid = String(a.meta.arg);
      s.votersLoadingByGroup[gid] = true;
      s.votersErrorByGroup[gid] = null;
    })
      .addCase(fetchVotersByGroup.fulfilled, (s, a) => {
        const { groupId, voters } = a.payload;
        const gid = String(groupId);
        s.votersLoadingByGroup[gid] = false;
        s.votersByGroup[gid] = voters || [];
      })
      .addCase(fetchVotersByGroup.rejected, (s, a) => {
        const gid = String(a.payload?.groupId ?? a.meta.arg);
        s.votersLoadingByGroup[gid] = false;
        s.votersErrorByGroup[gid] = a.payload?.message || 'Failed to fetch voters';
      });
  },
});

export const { clearVoteError, clearVotersErrorForGroup } = slice.actions;

/** ← Selectors פר-קבוצה */
export const selectVotersForGroup = (groupId) => (state) =>
  state.votes?.votersByGroup?.[String(groupId)] || [];

export const selectVotersLoadingForGroup = (groupId) => (state) =>
  !!state.votes?.votersLoadingByGroup?.[String(groupId)];

export const selectVotersErrorForGroup = (groupId) => (state) =>
  state.votes?.votersErrorByGroup?.[String(groupId)] || null;

export default slice.reducer;
