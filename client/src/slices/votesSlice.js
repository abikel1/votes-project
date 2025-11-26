// src/slices/votesSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import http from '../api/http';
import i18n from '../i18n';

/**
 * הצבעה למועמד/ת
 * POST /votes/create  body: { userId, groupId, candidateId }
 */
export const voteForCandidate = createAsyncThunk(
  'votes/voteForCandidate',
  async ({ groupId, candidateId }, { getState, rejectWithValue }) => {
    try {
      const userId = getState().auth?.userId;
      if (!userId) {
        // לא מחובר – הודעה מתורגמת
        return rejectWithValue(i18n.t('votes.errors.notLoggedIn'));
      }

      const { data } = await http.post('/votes/create', { userId, groupId, candidateId });
      return { groupId, candidateId, data };
    } catch (e) {
      return rejectWithValue(
        e?.response?.data?.message || i18n.t('votes.errors.voteFailed')
      );
    }
  }
);

/**
 * מצביעים לפי קבוצה
 * GET /votes/group/:groupId/voters
 */
export const fetchVotersByGroup = createAsyncThunk(
  'votes/fetchVotersByGroup',
  async (groupId, { rejectWithValue }) => {
    try {
      const { data } = await http.get(`/votes/group/${groupId}/voters`);
      const voters = Array.isArray(data) ? data : (data?.voters || []);
      return { groupId, voters };
    } catch (e) {
      return rejectWithValue({
        groupId,
        message:
          e?.response?.data?.message || i18n.t('votes.errors.fetchVotersFailed'),
      });
    }
  }
);

/**
 * האם המשתמש הנוכחי כבר הצביע בקבוצה
 * GET /votes/has-voted?userId=..&groupId=..
 */
export const checkHasVoted = createAsyncThunk(
  'votes/checkHasVoted',
  async ({ groupId }, { getState, rejectWithValue }) => {
    try {
      const userId = getState().auth?.userId;
      if (!userId) return rejectWithValue(false);

      const { data } = await http.get(`/votes/has-voted`, {
        params: { userId, groupId },
      });
      return !!data?.voted;
    } catch {
      return rejectWithValue(false);
    }
  }
);

/**
 * 🔔 מהשרת: קבוצות שהמשתמש הצביע בהן, ההצבעה הסתיימה, כולל זוכים
 * GET /votes/my-finished
 */
export const fetchMyFinishedVotedGroups = createAsyncThunk(
  'votes/fetchMyFinishedVotedGroups',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await http.get('/votes/my-finished');
      return data; // array
    } catch (e) {
      return rejectWithValue(i18n.t('votes.errors.fetchMyFinishedFailed'));
    }
  }
);

const initialState = {
  status: 'idle',
  error: null,
  lastVote: null,
  hasVoted: false,             // האם המשתמש הנוכחי הצביע בקבוצה האחרונה שנבדקה

  // 🔔 קבוצות שהמשתמש הצביע בהן וההצבעה הסתיימה (מהשרת)
  finishedVotedGroups: [],     // [{ groupId, groupName, endDate, winners: [...] }]
  finishedStatus: 'idle',
  finishedError: null,

  // מפות פר-קבוצה להצגת המצביעים
  votersByGroup: {},           // { [groupId]: Voter[] }
  votersLoadingByGroup: {},    // { [groupId]: boolean }
  votersErrorByGroup: {},      // { [groupId]: string|null }
};

const votesSlice = createSlice({
  name: 'votes',
  initialState,
  reducers: {
    clearVoteError(state) { state.error = null; },
    clearVotersErrorForGroup(state, action) {
      const gid = String(action.payload);
      if (gid) state.votersErrorByGroup[gid] = null;
    },
    // אופציונלי: איפוס סטטוס ההצבעה המקומי
    resetHasVoted(state) { state.hasVoted = false; },
  },
  extraReducers: (b) => {
    // הצבעה
    b.addCase(voteForCandidate.pending, (s) => {
      s.status = 'loading';
      s.error = null;
    });
    b.addCase(voteForCandidate.fulfilled, (s, a) => {
      s.status = 'succeeded';
      s.lastVote = a.payload;
      s.hasVoted = true;
    });
    b.addCase(voteForCandidate.rejected, (s, a) => {
      s.status = 'failed';
      s.error = a.payload || i18n.t('votes.errors.voteFailed');
    });

    // בדיקת "כבר הצבעתי"
    b.addCase(checkHasVoted.pending, (s) => {
      s.status = 'loading';
    });
    b.addCase(checkHasVoted.fulfilled, (s, a) => {
      s.status = 'succeeded';
      s.hasVoted = a.payload;
    });
    b.addCase(checkHasVoted.rejected, (s) => {
      s.status = 'failed';
      s.hasVoted = false;
    });

    // מצביעים לפי קבוצה
    b.addCase(fetchVotersByGroup.pending, (s, a) => {
      const gid = String(a.meta.arg);
      s.votersLoadingByGroup[gid] = true;
      s.votersErrorByGroup[gid] = null;
    });
    b.addCase(fetchVotersByGroup.fulfilled, (s, a) => {
      const gid = String(a.payload.groupId);
      s.votersLoadingByGroup[gid] = false;
      s.votersByGroup[gid] = a.payload.voters || [];
    });
    b.addCase(fetchVotersByGroup.rejected, (s, a) => {
      const gid = String(a.payload?.groupId ?? a.meta.arg);
      s.votersLoadingByGroup[gid] = false;
      s.votersErrorByGroup[gid] =
        a.payload?.message || i18n.t('votes.errors.fetchVotersFailed');
    });

    // 🔔 קבוצות שסיימו הצבעה עבור המשתמש
    b.addCase(fetchMyFinishedVotedGroups.pending, (s) => {
      s.finishedStatus = 'loading';
      s.finishedError = null;
    });
    b.addCase(fetchMyFinishedVotedGroups.fulfilled, (s, a) => {
      s.finishedStatus = 'succeeded';
      s.finishedVotedGroups = Array.isArray(a.payload) ? a.payload : [];
    });
    b.addCase(fetchMyFinishedVotedGroups.rejected, (s, a) => {
      s.finishedStatus = 'failed';
      s.finishedError = a.payload || i18n.t('votes.errors.fetchMyFinishedFailed');
    });
  },
});

export const {
  clearVoteError,
  clearVotersErrorForGroup,
  resetHasVoted,
} = votesSlice.actions;

export default votesSlice.reducer;

/** Selectors פר-קבוצה */
export const selectVotersForGroup = (groupId) => (state) =>
  state.votes?.votersByGroup?.[String(groupId)] || [];

export const selectVotersLoadingForGroup = (groupId) => (state) =>
  !!state.votes?.votersLoadingByGroup?.[String(groupId)];

export const selectVotersErrorForGroup = (groupId) => (state) =>
  state.votes?.votersErrorByGroup?.[String(groupId)] || null;

// 🔔 סלקטור לפופ-אפ
export const selectFinishedVotedGroups = (state) =>
  state.votes?.finishedVotedGroups || [];
