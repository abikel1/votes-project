import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import http from '../api/http';

// טען את כל המועמדים של קבוצה
export const fetchCandidatesByGroup = createAsyncThunk(
  'candidates/fetchByGroup',
  async (groupId, { rejectWithValue }) => {
    try {
      const { data } = await http.get(`/candidates/group/${groupId}`);
      return { groupId, list: Array.isArray(data) ? data : [] };
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || 'Failed to load candidates');
    }
  }
);

// צור מועמד בקבוצה
export const createCandidate = createAsyncThunk(
  'candidates/create',
  async ({ groupId, name, description, symbol, photoUrl }, { rejectWithValue }) => {
    try {
      const { data } = await http.post('/candidates/create', {
        groupId, name, description, symbol, photoUrl
      });
      return { groupId, candidate: data };
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || 'Failed to create candidate');
    }
  }
);

// עדכון מועמד קיים
export const updateCandidate = createAsyncThunk(
  'candidates/update',
  async ({ candidateId, groupId, patch }, { rejectWithValue }) => {
    try {
      const { data } = await http.put(`/candidates/${candidateId}`, patch);
      return { groupId, candidate: data };
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || 'Failed to update candidate');
    }
  }
);

// מחיקת מועמד
export const deleteCandidate = createAsyncThunk(
  'candidates/delete',
  async ({ candidateId, groupId }, { rejectWithValue }) => {
    try {
      await http.delete(`/candidates/${candidateId}`);
      return { candidateId, groupId };
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || 'Failed to delete candidate');
    }
  }
);

export const applyCandidate = createAsyncThunk(
  'candidates/apply',
  async ({ groupId, name, description, symbol, photoUrl }, { rejectWithValue }) => {
    try {
      const { data } = await http.post
      (`/candidates/${groupId}/applyCandidate`, {
        name, description, symbol, photoUrl
      });
      return { groupId, candidate: data };
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || 'Failed to apply candidate');
    }
  }
);


// אישור בקשת מועמד
export const approveCandidateRequest = createAsyncThunk(
  'candidates/approveCandidateRequest',
  async ({ groupId, requestId }, { rejectWithValue }) => {
    try {
      const { data } = await http.post(
        `/candidates/${groupId}/approveCandidates/${requestId}`
      );

      return {
        requestId: data.requestId,
        groupId: data.groupId,
        candidate: data.candidate
      };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);


// דחיית בקשת מועמד
export const rejectCandidateRequest = createAsyncThunk(
  'candidates/rejectCandidateRequest',
  async ({ groupId, requestId }, { rejectWithValue }) => {
    try {
      const { data } = await http.post(
        `/candidates/${groupId}/rejectCandidates/${requestId}`
      );

      return {
        requestId: data.requestId,
        groupId: data.groupId
      };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);


const candidateSlice = createSlice({
  name: 'candidates',
  initialState: {
    listByGroup: {},       // { [groupId]: Candidate[] }
    loadingByGroup: {},    // { [groupId]: boolean }
    errorByGroup: {},
    candidateRequestsByGroup: {}, // { [groupId]: [] }
    // { [groupId]: string|null }
    creating: false,
    createError: null,
    applying: false,
    applyError: null,
    updatingById: {},      // { [candidateId]: boolean }
    updateErrorById: {},   // { [candidateId]: string|null }
  },
  reducers: {
    // ⬅️ אינקרמנט/דקרמנט אופטימי לדוגמה להצבעות
    optimisticIncVote: (s, { payload }) => {
      const { groupId, candidateId, delta = 1 } = payload || {};
      const list = s.listByGroup[groupId];
      if (!Array.isArray(list)) return;
      const idx = list.findIndex(c => String(c._id) === String(candidateId));
      if (idx === -1) return;
      const curr = list[idx].votesCount ?? 0;
      const next = curr + delta;
      list[idx].votesCount = next < 0 ? 0 : next; // לא לרדת מתחת ל־0
    },
  },
  extraReducers: (builder) => {
    builder
      // fetch
      .addCase(fetchCandidatesByGroup.pending, (s, a) => {
        const gid = a.meta.arg;
        s.loadingByGroup[gid] = true;
        s.errorByGroup[gid] = null;
      })
      .addCase(fetchCandidatesByGroup.fulfilled, (s, a) => {
        const { groupId, list } = a.payload;
        s.loadingByGroup[groupId] = false;
        s.listByGroup[groupId] = list;
      })
      .addCase(fetchCandidatesByGroup.rejected, (s, a) => {
        const gid = a.meta.arg;
        s.loadingByGroup[gid] = false;
        s.errorByGroup[gid] = a.payload;
      })

      // create
      .addCase(createCandidate.pending, (s) => {
        s.creating = true; s.createError = null;
      })
      .addCase(createCandidate.fulfilled, (s, a) => {
        s.creating = false;
        const { groupId, candidate } = a.payload;
        if (!Array.isArray(s.listByGroup[groupId])) s.listByGroup[groupId] = [];
        s.listByGroup[groupId].unshift(candidate);
      })
      .addCase(createCandidate.rejected, (s, a) => {
        s.creating = false; s.createError = a.payload;
      })

      // update
      .addCase(updateCandidate.pending, (s, a) => {
        const { candidateId } = a.meta.arg || {};
        if (candidateId) {
          s.updatingById[candidateId] = true;
          s.updateErrorById[candidateId] = null;
        }
      })
      .addCase(updateCandidate.fulfilled, (s, a) => {
        const { groupId, candidate } = a.payload;
        const list = s.listByGroup[groupId];
        if (Array.isArray(list)) {
          const idx = list.findIndex(c => String(c._id) === String(candidate._id));
          if (idx !== -1) {
            list[idx] = candidate;
          }
        }
        s.updatingById[candidate._id] = false;
      })
      .addCase(updateCandidate.rejected, (s, a) => {
        const { candidateId } = a.meta.arg || {};
        if (candidateId) {
          s.updatingById[candidateId] = false;
          s.updateErrorById[candidateId] = a.payload;
        }
      })

      // delete
      .addCase(deleteCandidate.fulfilled, (s, a) => {
        const { groupId, candidateId } = a.payload;
        const list = s.listByGroup[groupId];
        if (!Array.isArray(list)) return;
        s.listByGroup[groupId] = list.filter(c => String(c._id) !== String(candidateId));
        // נקה שגיאות/סטטוסים ישנים
        delete s.updatingById[candidateId];
        delete s.updateErrorById[candidateId];
      })
      .addCase(applyCandidate.pending, (state, action) => {
        state.applying = true;
        state.applyError = null;
      })
      .addCase(applyCandidate.fulfilled, (state, action) => {
        state.applying = false;
        const { groupId, candidate } = action.payload;
        if (!Array.isArray(state.listByGroup[groupId])) state.listByGroup[groupId] = [];
        state.listByGroup[groupId].unshift(candidate); // מוסיף את המועמד לראש הרשימה
      })
      .addCase(applyCandidate.rejected, (state, action) => {
        state.applying = false;
        state.applyError = action.payload;
      })

      .addCase(approveCandidateRequest.pending, (state) => {
        state.loadingRequests = true;
        state.requestsError = null;
      })
      .addCase(approveCandidateRequest.fulfilled, (state, action) => {
        console.log(state.candidateRequestsByGroup[groupId], requestId);

        const { requestId, groupId, candidate } = action.payload;

        // להסיר את הבקשה
     state.candidateRequestsByGroup[groupId] =
  state.candidateRequestsByGroup[groupId]?.filter(r => r._id !== requestId) || [];


        // להוסיף את המועמד החדש לרשימת המועמדים
        if (!Array.isArray(state.listByGroup[groupId]))
          state.listByGroup[groupId] = [];

        state.listByGroup[groupId].push(candidate);
      })

      .addCase(approveCandidateRequest.rejected, (state, action) => {
        state.loadingRequests = false;
        state.requestsError = action.payload;
      })

      // דחיית בקשה
      .addCase(rejectCandidateRequest.pending, (state) => {
        state.loadingRequests = true;
        state.requestsError = null;
      })
      .addCase(rejectCandidateRequest.fulfilled, (state, action) => {
        const { requestId, groupId } = action.payload;

      state.candidateRequestsByGroup[groupId] =
  state.candidateRequestsByGroup[groupId]?.filter(r => r._id !== requestId) || [];

      })
      .addCase(rejectCandidateRequest.rejected, (state, action) => {
        state.loadingRequests = false;
        state.requestsError = action.payload;
      });
  },
});

export const { optimisticIncVote } = candidateSlice.actions;
export default candidateSlice.reducer;

// selectors
export const selectCandidatesForGroup = (groupId) => (state) =>
  state.candidates.listByGroup[groupId] || [];
export const selectCandidatesLoadingForGroup = (groupId) => (state) =>
  !!state.candidates.loadingByGroup[groupId];
export const selectCandidatesErrorForGroup = (groupId) => (state) =>
  state.candidates.errorByGroup[groupId] || null;

export const selectCandidateUpdating = (candidateId) => (state) =>
  !!state.candidates.updatingById[candidateId];
export const selectCandidateUpdateError = (candidateId) => (state) =>
  state.candidates.updateErrorById[candidateId] || null;
// selectors
export const selectApplyingCandidate = (state) => state.candidates.applying;
export const selectApplyCandidateError = (state) => state.candidates.applyError;

export const selectCandidateRequestsForGroup = (state, groupId) =>
  state.candidates.candidateRequestsByGroup[groupId] || [];