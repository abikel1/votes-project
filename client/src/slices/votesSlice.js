// import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// import http from '../api/http';

// /**
//  * הצבעה למועמד/ת
//  * POST /votes/create  body: { userId, groupId, candidateId }
//  */
// export const voteForCandidate = createAsyncThunk(
//   'votes/voteForCandidate',
//   async ({ groupId, candidateId }, { getState, rejectWithValue }) => {
//     try {
//       const userId = getState().auth?.userId;
//       if (!userId) return rejectWithValue('User not logged in');

//       const { data } = await http.post('/votes/create', { userId, groupId, candidateId });
//       return { groupId, candidateId, data };
//     } catch (e) {
//       return rejectWithValue(e?.response?.data?.message || 'Vote failed');
//     }
//   }
// );

// /**
//  * ← חדש: מצביעים לפי קבוצה
//  * שימי לב: עדכני את ה-URL אם השרת שלך שונה.
//  * דוגמאות נפוצות:
//  *   /votes/group/:groupId/voters
//  *   /votes/voters?groupId=...
//  */
// export const fetchVotersByGroup = createAsyncThunk(
//   'votes/fetchVotersByGroup',
//   async (groupId, { rejectWithValue }) => {
//     try {
//       const { data } = await http.get(`/votes/group/${groupId}/voters`);
//       // מצופה מערך של מצביעים עם שדות כמו: _id/userId, name/email, votedAt...
//       return { groupId, voters: Array.isArray(data) ? data : (data?.voters || []) };
//     } catch (e) {
//       return rejectWithValue({
//         groupId,
//         message: e?.response?.data?.message || 'Failed to fetch voters'
//       });
//     }
//   });


// export const checkHasVoted = createAsyncThunk(
//   'votes/checkHasVoted',
//   async ({ groupId }, { getState, rejectWithValue }) => {
//     try {
//       const userId = getState().auth?.userId;
//       if (!userId) return rejectWithValue(false);

//       const { data } = await http.get(`/votes/has-voted?userId=${userId}&groupId=${groupId}`);
//       return data.voted;
//     } catch (e) {
//       return rejectWithValue(false);
//     }
//   }
// );

// const initialState = {
//   status: 'idle',
//   error: null,
//   lastVote: null,

//   // ← חדש: אחסון פר-קבוצה
//   votersByGroup: {},          // { [groupId]: array }
//   votersLoadingByGroup: {},   // { [groupId]: boolean }
//   votersErrorByGroup: {},     // { [groupId]: string|null }
// };

// const slice = createSlice({
//   name: 'votes',
//   initialState,
//   reducers: {
//     clearVoteError(state) { state.error = null; },
//     // אופציונלי: איפוס שגיאה של מצביעים לקבוצה
//     clearVotersErrorForGroup(state, action) {
//       const gid = String(action.payload);
//       if (gid) state.votersErrorByGroup[gid] = null;
//     },
//   },
//   extraReducers: (b) => {
//     b.addCase(voteForCandidate.pending, (s) => { s.status = 'loading'; s.error = null; })
//         status: 'idle',
//         error: null,
//         lastVote: null,
//         hasVoted: false, // ✅ שדה חדש
//       },
//       reducers: {
//         clearVoteError(s) { s.error = null; }
//       },
//       extraReducers: (b) => {
//         b.addCase(voteForCandidate.pending, (s) => { s.status = 'loading'; s.error = null; })
//           .addCase(voteForCandidate.fulfilled, (state, action) => {
//             state.status = 'succeeded';
//             state.lastVote = action.payload;
//             state.hasVoted = true; // ✅ עדכון Redux state במקום setHasVoted
//           })
//           .addCase(voteForCandidate.rejected, (s, a) => { s.status = 'failed'; s.error = a.payload; })

//           .addCase(checkHasVoted.pending, (s) => { s.status = 'loading'; })
//           .addCase(checkHasVoted.fulfilled, (s, a) => { s.status = 'succeeded'; s.hasVoted = a.payload; })
//           .addCase(checkHasVoted.rejected, (s) => { s.status = 'failed'; s.hasVoted = false; })

//         b.addCase(fetchVotersByGroup.pending, (s, a) => {
//           const gid = String(a.meta.arg);
//           s.votersLoadingByGroup[gid] = true;
//           s.votersErrorByGroup[gid] = null;
//         })
//           .addCase(fetchVotersByGroup.fulfilled, (s, a) => {
//             const { groupId, voters } = a.payload;
//             const gid = String(groupId);
//             s.votersLoadingByGroup[gid] = false;
//             s.votersByGroup[gid] = voters || [];
//           })
//           .addCase(fetchVotersByGroup.rejected, (s, a) => {
//             const gid = String(a.payload?.groupId ?? a.meta.arg);
//             s.votersLoadingByGroup[gid] = false;
//             s.votersErrorByGroup[gid] = a.payload?.message || 'Failed to fetch voters';
//           });
//       },
//     });

//     export const { clearVoteError, clearVotersErrorForGroup } = slice.actions;

//     /** ← Selectors פר-קבוצה */
//     export const selectVotersForGroup = (groupId) => (state) =>
//       state.votes?.votersByGroup?.[String(groupId)] || [];

//     export const selectVotersLoadingForGroup = (groupId) => (state) =>
//       !!state.votes?.votersLoadingByGroup?.[String(groupId)];

//     export const selectVotersErrorForGroup = (groupId) => (state) =>
//       state.votes?.votersErrorByGroup?.[String(groupId)] || null;

//     export default slice.reducer;


// src/slices/votesSlice.js
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
        message: e?.response?.data?.message || 'Failed to fetch voters',
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

const initialState = {
  status: 'idle',
  error: null,
  lastVote: null,
  hasVoted: false,             // האם המשתמש הנוכחי הצביע בקבוצה האחרונה שנבדקה

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
      s.error = a.payload;
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
      s.votersErrorByGroup[gid] = a.payload?.message || 'Failed to fetch voters';
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
