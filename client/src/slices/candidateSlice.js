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

const candidateSlice = createSlice({
  name: 'candidates',
  initialState: {
    listByGroup: {},       // { [groupId]: Candidate[] }
    loadingByGroup: {},    // { [groupId]: boolean }
    errorByGroup: {},      // { [groupId]: string|null }
    creating: false,
    createError: null,
  },
  reducers: {
    // ⬅️ חדש: אינקרמנט/דקרמנט אופטימי
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
      .addCase(deleteCandidate.fulfilled, (s, a) => {
        const { groupId, candidateId } = a.payload;
        const list = s.listByGroup[groupId];
        if (!Array.isArray(list)) return;
        s.listByGroup[groupId] = list.filter(c => String(c._id) !== String(candidateId));
      });
  },
});

export const { optimisticIncVote } = candidateSlice.actions; // ⬅️ חדש
export default candidateSlice.reducer;

// selectors (ללא שינוי)
export const selectCandidatesForGroup = (groupId) => (state) =>
  state.candidates.listByGroup[groupId] || [];
export const selectCandidatesLoadingForGroup = (groupId) => (state) =>
  !!state.candidates.loadingByGroup[groupId];
export const selectCandidatesErrorForGroup = (groupId) => (state) =>
  state.candidates.errorByGroup[groupId] || null;