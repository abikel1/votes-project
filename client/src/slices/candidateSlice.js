// src/slices/candidateSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import http from '../api/http';
import i18n from '../i18n';

// טען את כל המועמדים של קבוצה
export const fetchCandidatesByGroup = createAsyncThunk(
  'candidates/fetchByGroup',
  async (groupId, { rejectWithValue }) => {
    try {
      const { data } = await http.get(`/candidates/group/${groupId}`);
      return { groupId, list: Array.isArray(data) ? data : [] };
    } catch (err) {
      return rejectWithValue(
        i18n.t('candidates.errors.loadFailed')
      );
    }
  }
);

// צור מועמד בקבוצה (ע"י מנהל)
export const createCandidate = createAsyncThunk(
  'candidates/create',
  async ({ groupId, name, description, symbol, photoUrl }, { rejectWithValue }) => {
    try {
      const { data } = await http.post('/candidates/create', {
        groupId, name, description, symbol, photoUrl
      });
      return { groupId, candidate: data };
    } catch (err) {
      return rejectWithValue(
        i18n.t('candidates.errors.createFailed')
      );
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
      return rejectWithValue(
        i18n.t('candidates.errors.updateFailed')
      );
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
      return rejectWithValue(
        i18n.t('candidates.errors.deleteFailed')
      );
    }
  }
);

// הגשת מועמדות ע"י משתמש – שולח בקשה, לא יוצר מועמד בפועל
export const applyCandidate = createAsyncThunk(
  'candidates/apply',
  async ({ groupId, name, description, symbol, photoUrl }, { rejectWithValue }) => {
    try {
      const { data } = await http.post(
        `/candidates/${groupId}/applyCandidate`,
        { name, description, symbol, photoUrl }
      );
      // data = { ok, groupId, request }
      return { groupId: data.groupId, request: data.request };
    } catch (err) {
      return rejectWithValue(
        i18n.t('candidates.errors.applyFailed')
      );
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
      return rejectWithValue(
        i18n.t('candidates.errors.approveFailed')
      );
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
      return rejectWithValue(
        i18n.t('candidates.errors.rejectFailed')
      );
    }
  }
);

// בקשות מועמדים בקבוצה (עבור המנהל)
export const fetchCandidateRequestsByGroup = createAsyncThunk(
  'candidates/fetchRequestsByGroup',
  async (groupId, { rejectWithValue }) => {
    try {
      const { data } = await http.get(`/groups/${groupId}/candidate-requests`);
      return { groupId, requests: data };
    } catch (err) {
      return rejectWithValue(
        i18n.t('candidates.errors.fetchRequestsFailed')
      );
    }
  }
);

const candidateSlice = createSlice({
  name: 'candidates',
  initialState: {
    listByGroup: {},              // { [groupId]: Candidate[] }
    loadingByGroup: {},           // { [groupId]: boolean }
    errorByGroup: {},             // { [groupId]: string|null }
    candidateRequestsByGroup: {}, // { [groupId]: CandidateRequest[] }
    creating: false,
    createError: null,
    applying: false,
    applyError: null,
    updatingById: {},             // { [candidateId]: boolean }
    updateErrorById: {},          // { [candidateId]: string|null }
    loadingRequests: false,
    requestsError: null,
  },
  reducers: {
    // עדכון אופטימי לספירת ההצבעות
    optimisticIncVote: (s, { payload }) => {
      const { groupId, candidateId, delta = 1 } = payload || {};
      const list = s.listByGroup[groupId];
      if (!Array.isArray(list)) return;
      const idx = list.findIndex(c => String(c._id) === String(candidateId));
      if (idx === -1) return;
      const curr = list[idx].votesCount ?? 0;
      const next = curr + delta;
      list[idx].votesCount = next < 0 ? 0 : next;
    },
  },
  extraReducers: (builder) => {
    builder
      // ===== fetch candidates =====
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

      // ===== create candidate (ע"י מנהל) =====
      .addCase(createCandidate.pending, (s) => {
        s.creating = true;
        s.createError = null;
      })
      .addCase(createCandidate.fulfilled, (s, a) => {
        s.creating = false;
        const { groupId, candidate } = a.payload;
        if (!Array.isArray(s.listByGroup[groupId])) s.listByGroup[groupId] = [];
        s.listByGroup[groupId].unshift(candidate);
      })
      .addCase(createCandidate.rejected, (s, a) => {
        s.creating = false;
        s.createError = a.payload;
      })

      // ===== update candidate =====
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

      // ===== delete candidate =====
      .addCase(deleteCandidate.fulfilled, (s, a) => {
        const { groupId, candidateId } = a.payload;
        const list = s.listByGroup[groupId];
        if (!Array.isArray(list)) return;
        s.listByGroup[groupId] = list.filter(c => String(c._id) !== String(candidateId));
        delete s.updatingById[candidateId];
        delete s.updateErrorById[candidateId];
        // שימי לב: בקשות מועמדות מתעדכנות בצד השרת (group.candidateRequests),
        // ויגיעו מחדש דרך fetchGroupWithMembers / fetchCandidateRequestsByGroup.
      })

      // ===== apply candidate – ניהול סטטוס בקישה =====
      .addCase(applyCandidate.pending, (state) => {
        state.applying = true;
        state.applyError = null;
      })
      .addCase(applyCandidate.fulfilled, (state, action) => {
        state.applying = false;
        const { groupId, request } = action.payload || {};
        if (!groupId || !request) return;

        if (!Array.isArray(state.candidateRequestsByGroup[groupId])) {
          state.candidateRequestsByGroup[groupId] = [];
        }

        const idx = state.candidateRequestsByGroup[groupId].findIndex(
          (r) => String(r._id) === String(request._id)
        );

        if (idx !== -1) {
          state.candidateRequestsByGroup[groupId][idx] = request;
        } else {
          state.candidateRequestsByGroup[groupId].push(request);
        }
      })
      .addCase(applyCandidate.rejected, (state, action) => {
        state.applying = false;
        state.applyError = action.payload;
      })

      // ===== fetch candidate requests =====
      .addCase(fetchCandidateRequestsByGroup.fulfilled, (state, action) => {
        const { groupId, requests } = action.payload;
        state.candidateRequestsByGroup[groupId] = requests;
      })

      // ===== approve request =====
      .addCase(approveCandidateRequest.pending, (state) => {
        state.loadingRequests = true;
        state.requestsError = null;
      })
      .addCase(approveCandidateRequest.fulfilled, (state, action) => {
        const { requestId, groupId, candidate } = action.payload;
        state.loadingRequests = false;

        // מסירים את הבקשה מהטבלה
        state.candidateRequestsByGroup[groupId] =
          state.candidateRequestsByGroup[groupId]?.filter(
            (r) => String(r._id) !== String(requestId)
          ) || [];

        // מוסיפים את המועמד לרשימת המועמדים הפעילים
        if (!Array.isArray(state.listByGroup[groupId])) {
          state.listByGroup[groupId] = [];
        }
        state.listByGroup[groupId].push(candidate);
      })
      .addCase(approveCandidateRequest.rejected, (state, action) => {
        state.loadingRequests = false;
        state.requestsError = action.payload;
      })

      // ===== reject request =====
      .addCase(rejectCandidateRequest.pending, (state) => {
        state.loadingRequests = true;
        state.requestsError = null;
      })
      .addCase(rejectCandidateRequest.fulfilled, (state, action) => {
        const { requestId, groupId } = action.payload;
        state.loadingRequests = false;
        state.candidateRequestsByGroup[groupId] =
          state.candidateRequestsByGroup[groupId]?.filter(
            (r) => String(r._id) !== String(requestId)
          ) || [];
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

export const selectCandidatesErrorForGroup = (groupId) =>
  (state) => state.candidates.errorByGroup[groupId] || null;

export const selectCandidateUpdating = (candidateId) => (state) =>
  !!state.candidates.updatingById[candidateId];

export const selectCandidateUpdateError = (candidateId) => (state) =>
  state.candidates.updateErrorById[candidateId] || null;

export const selectApplyingCandidate = (state) => state.candidates.applying;
export const selectApplyCandidateError = (state) => state.candidates.applyError;

export const selectCandidateRequestsForGroup = (state, groupId) =>
  state.candidates.candidateRequestsByGroup[groupId] || [];
