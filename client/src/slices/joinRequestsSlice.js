import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import http from '../api/http';
import i18n from '../i18n';

function getUserKey() {
  try {
    return (
      localStorage.getItem('userId') ||
      localStorage.getItem('userEmail') ||
      'anon'
    );
  } catch {
    return 'anon';
  }
}

function getPendingKey() {
  return `join_pending_groups_${getUserKey()}`;
}

function getRemovedKey() {
  return `removed_by_owner_groups_${getUserKey()}`;
}

function getRejectedKey() {
  return `rejected_groups_${getUserKey()}`;
}

function loadRejectedMap() {
  try {
    const raw = localStorage.getItem(getRejectedKey());
    if (!raw) return {};
    const obj = JSON.parse(raw);
    return obj && typeof obj === 'object' ? obj : {};
  } catch {
    return {};
  }
}

function saveRejectedMap(map) {
  try {
    localStorage.setItem(getRejectedKey(), JSON.stringify(map || {}));
  } catch { }
}

function loadPendingFromLS() {
  try {
    const raw = localStorage.getItem(getPendingKey());
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return new Set();
    return new Set(arr.map(String));
  } catch {
    return new Set();
  }
}

function savePendingToLS(pendingSet) {
  try {
    localStorage.setItem(
      getPendingKey(),
      JSON.stringify(Array.from(pendingSet))
    );
  } catch { }
}

function loadRemovedMap() {
  try {
    const raw = localStorage.getItem(getRemovedKey());
    if (!raw) return {};
    const obj = JSON.parse(raw);
    return obj && typeof obj === 'object' ? obj : {};
  } catch {
    return {};
  }
}

function saveRemovedMap(map) {
  try {
    localStorage.setItem(getRemovedKey(), JSON.stringify(map || {}));
  } catch { }
}

export const requestJoinGroup = createAsyncThunk(
  'joinReq/requestJoinGroup',
  async (groupId, { getState, rejectWithValue }) => {
    const { auth } = getState();
    const isAuthed =
      !!auth?.userId ||
      !!auth?.userEmail ||
      !!localStorage.getItem('authToken');
    if (!isAuthed) {
      return rejectWithValue('AUTH_REQUIRED');
    }
    try {
      const { data } = await http.post(`/groups/${groupId}/join`);
      return { groupId: String(groupId), group: data };
    } catch (err) {
      return rejectWithValue(i18n.t('join.errors.sendRequestFailed'));
    }
  }
);

export const fetchMyJoinStatuses = createAsyncThunk(
  'joinReq/fetchMyStatuses',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await http.get('/groups/my-join-status');
      return data;
    } catch (err) {
      return rejectWithValue(i18n.t('join.errors.statusLoadFailed'));
    }
  }
);

export const fetchJoinRequests = createAsyncThunk(
  'joinReq/fetchJoinRequests',
  async (groupId, { rejectWithValue }) => {
    try {
      const { data } = await http.get(`/groups/${groupId}/join-requests`);
      return { groupId: String(groupId), requests: data };
    } catch (err) {
      return rejectWithValue(i18n.t('join.errors.loadRequestsFailed'));
    }
  }
);

export const approveJoinRequest = createAsyncThunk(
  'joinReq/approve',
  async ({ groupId, requestId }, { rejectWithValue }) => {
    try {
      const { data } = await http.patch(
        `/groups/${groupId}/join-requests/${requestId}/approve`
      );
      return { groupId: String(groupId), requestId, response: data };
    } catch (err) {
      return rejectWithValue(i18n.t('join.errors.approveFailed'));
    }
  }
);

export const rejectJoinRequest = createAsyncThunk(
  'joinReq/reject',
  async ({ groupId, requestId }, { rejectWithValue }) => {
    try {
      const { data } = await http.patch(
        `/groups/${groupId}/join-requests/${requestId}/reject`
      );
      return { groupId: String(groupId), requestId, response: data };
    } catch (err) {
      return rejectWithValue(i18n.t('join.errors.rejectFailed'));
    }
  }
);

const joinReqSlice = createSlice({
  name: 'joinReq',
  initialState: {
    byGroup: {},
    actionError: null,
    my: {},
    removedNotice: {},
  },
  reducers: {
    clearJoinRequestsError(s) {
      s.actionError = null;
    },

    hydratePendingFromLocalStorage(s) {
      const set = loadPendingFromLS();
      set.forEach((gid) => {
        const prev = s.my[gid] || {};
        s.my[gid] = { ...prev, requesting: false, status: 'pending', error: null };
      });
      s.removedNotice = loadRemovedMap();
      const rejectedMap = loadRejectedMap();
      Object.entries(rejectedMap).forEach(([gid, ts]) => {
        const prev = s.my[gid] || {};
        s.my[gid] = {
          ...prev,
          requesting: false,
          status: 'rejected',
          error: null,
          rejectedAt: ts || prev.rejectedAt || Date.now(),
        };
      });
    },

    markJoinedLocally(s, a) {
      const gid = String(a.payload);
      s.my[gid] = { requesting: false, status: 'member', error: null };

      const set = loadPendingFromLS();
      if (set.has(gid)) {
        set.delete(gid);
        savePendingToLS(set);
      }

      if (s.removedNotice[gid]) {
        delete s.removedNotice[gid];
        saveRemovedMap(s.removedNotice);
      }

      const rejectedMap = loadRejectedMap();
      if (rejectedMap[gid]) {
        delete rejectedMap[gid];
        saveRejectedMap(rejectedMap);
      }
    },

    clearRemovedNotice(s, a) {
      const gid = String(a.payload);
      if (s.removedNotice[gid]) {
        delete s.removedNotice[gid];
        saveRemovedMap(s.removedNotice);
      }
    },

    clearRejectedForGroup(s, a) {
      const gid = String(a.payload);
      const prev = s.my[gid] || {};
      if (prev.status === 'rejected') {
        s.my[gid] = { requesting: false, status: 'none', error: null };
      }
      const rejectedMap = loadRejectedMap();
      if (rejectedMap[gid]) {
        delete rejectedMap[gid];
        saveRejectedMap(rejectedMap);
      }
    },
  },
  extraReducers: (b) => {
    b.addCase(fetchJoinRequests.pending, (s, a) => {
      const g = String(a.meta.arg);
      s.byGroup[g] = {
        loading: true,
        error: null,
        list: s.byGroup[g]?.list || [],
      };
    })
      .addCase(fetchJoinRequests.fulfilled, (s, a) => {
        const { groupId, requests } = a.payload;
        s.byGroup[groupId] = {
          loading: false,
          error: null,
          list: (Array.isArray(requests) ? requests : []).filter(
            (r) => r?.status === 'pending'
          ),
        };
      })
      .addCase(fetchJoinRequests.rejected, (s, a) => {
        const g = String(a.meta.arg);
        s.byGroup[g] = { loading: false, error: a.payload, list: [] };
      })
      .addCase(approveJoinRequest.fulfilled, (s, a) => {
        const { groupId, requestId, response } = a.payload;
        const st = s.byGroup[groupId];
        if (!st) return;
        if (Array.isArray(response?.pending)) {
          st.list = response.pending.filter((r) => r?.status === 'pending');
        } else {
          st.list = (st.list || []).filter((r) => r._id !== requestId);
        }
      })
      .addCase(rejectJoinRequest.fulfilled, (s, a) => {
        const { groupId, requestId, response } = a.payload;
        const st = s.byGroup[groupId];
        if (!st) return;
        if (Array.isArray(response?.pending)) {
          st.list = response.pending.filter((r) => r?.status === 'pending');
        } else {
          st.list = (st.list || []).filter((r) => r._id !== requestId);
        }
      })
      .addCase(approveJoinRequest.rejected, (s, a) => {
        s.actionError = a.payload;
      })
      .addCase(rejectJoinRequest.rejected, (s, a) => {
        s.actionError = a.payload;
      })

      .addCase(requestJoinGroup.pending, (s, a) => {
        const gid = String(a.meta.arg);
        s.my[gid] = { requesting: true, status: 'pending', error: null };
        const set = loadPendingFromLS();
        set.add(gid);
        savePendingToLS(set);
        if (s.removedNotice[gid]) {
          delete s.removedNotice[gid];
          saveRemovedMap(s.removedNotice);
        }
        const rejectedMap = loadRejectedMap();
        if (rejectedMap[gid]) {
          delete rejectedMap[gid];
          saveRejectedMap(rejectedMap);
        }
      })

      .addCase(requestJoinGroup.fulfilled, (s, a) => {
        const gid = String(a.payload.groupId);
        s.my[gid] = { requesting: false, status: 'pending', error: null };
      })
      .addCase(requestJoinGroup.rejected, (s, a) => {
        const gid = String(a.meta.arg);
        if (a.payload === 'AUTH_REQUIRED') {
          s.my[gid] = { requesting: false, status: 'none', error: null };
          return;
        }
        s.my[gid] = {
          requesting: false,
          status: 'error',
          error: a.payload || i18n.t('join.errors.sendRequestFailed'),
        };
        s.actionError = a.payload;
        const set = loadPendingFromLS();
        if (set.has(gid)) {
          set.delete(gid);
          savePendingToLS(set);
        }
      })

      .addCase('groups/fetchMy/fulfilled', (s, a) => {
        const joined = Array.isArray(a.payload?.joined) ? a.payload.joined : [];
        const currentJoinedSet = new Set(joined.map((g) => String(g._id)));

        const ls = loadPendingFromLS();
        for (const g of joined) {
          const gid = String(g._id);
          s.my[gid] = { requesting: false, status: 'member', error: null };
          if (ls.has(gid)) ls.delete(gid);
          if (s.removedNotice[gid]) {
            delete s.removedNotice[gid];
            saveRemovedMap(s.removedNotice);
          }
        }
        for (const [gid, st] of Object.entries(s.my)) {
          if (st?.status === 'member' && !currentJoinedSet.has(String(gid))) {
            s.my[gid] = { requesting: false, status: 'none', error: null };
            s.removedNotice[gid] = Date.now();
          }
        }

        savePendingToLS(ls);
        saveRemovedMap(s.removedNotice);
      })
      .addCase(fetchMyJoinStatuses.fulfilled, (s, a) => {
        const ids = Array.isArray(a.payload?.pending)
          ? a.payload.pending.map(String)
          : [];
        const serverSet = new Set(ids);

        serverSet.forEach((gid) => {
          s.my[gid] = { requesting: false, status: 'pending', error: null };
        });

        const localSet = loadPendingFromLS();
        const rejectedMap = loadRejectedMap();
        for (const [gid, st] of Object.entries(s.my)) {
          if (st?.status === 'pending' && !serverSet.has(String(gid))) {
            const ts = Date.now();
            s.my[gid] = {
              requesting: false,
              status: 'rejected',
              error: null,
              rejectedAt: ts,
            };
            if (localSet.has(gid)) localSet.delete(gid);
            rejectedMap[gid] = ts;
          }
        }

        const union = new Set([...localSet, ...serverSet]);
        savePendingToLS(union);
        saveRejectedMap(rejectedMap);
      })

      .addCase('auth/logout', (s) => {
        s.byGroup = {};
        s.actionError = null;
        s.my = {};
        s.removedNotice = {};
      });
  },
});

export const {
  clearJoinRequestsError,
  hydratePendingFromLocalStorage,
  markJoinedLocally,
  clearRemovedNotice,
  clearRejectedForGroup,
} = joinReqSlice.actions;

export default joinReqSlice.reducer;

export const selectJoinRequestsForGroup = (groupId) => (s) =>
  s.joinReq.byGroup[groupId]?.list || [];
export const selectJoinRequestsLoading = (groupId) => (s) =>
  !!s.joinReq.byGroup[groupId]?.loading;
export const selectJoinRequestsError = (groupId) => (s) =>
  s.joinReq.byGroup[groupId]?.error || null;

export const selectMyPendingSet = createSelector(
  (s) => s.joinReq.my,
  (my) => {
    const out = new Set();
    for (const [gid, st] of Object.entries(my || {})) {
      if (st?.status === 'pending') out.add(String(gid));
    }
    return out;
  }
);

export const selectMyRejectedSet = createSelector(
  (s) => s.joinReq.my,
  (my) => {
    const out = new Set();
    for (const [gid, st] of Object.entries(my || {})) {
      if (st?.status === 'rejected') out.add(String(gid));
    }
    return out;
  }
);

export const selectMyMemberSet = createSelector(
  (s) => s.joinReq.my,
  (my) => {
    const out = new Set();
    for (const [gid, st] of Object.entries(my || {})) {
      if (st?.status === 'member') out.add(String(gid));
    }
    return out;
  }
);

export const selectWasRemovedFromGroup = (groupId) => (s) =>
  !!s.joinReq.removedNotice?.[String(groupId)];

export const selectMyStatusByGroup = (groupId) => (s) =>
  s.joinReq.my?.[String(groupId)]?.status || 'none';
