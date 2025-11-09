// client/src/slices/groupsSlice.js
import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import http from '../api/http';

/* ===== Thunks ===== */

export const fetchGroups = createAsyncThunk('groups/fetchAll', async (_, { rejectWithValue }) => {
  try { const { data } = await http.get('/groups'); return data; }
  catch (err) { return rejectWithValue(err?.response?.data?.message || 'Failed to load groups'); }
});

export const fetchGroupOnly = createAsyncThunk('groups/fetchOnly', async (groupId, { rejectWithValue }) => {
  try { const { data } = await http.get(`/groups/${groupId}`); return data; }
  catch (err) { return rejectWithValue(err?.response?.data?.message || 'Failed to load group'); }
});

export const createGroup = createAsyncThunk('groups/create', async (payload, { rejectWithValue }) => {
  try { const { data } = await http.post('/groups/create', payload); return data; }
  catch (err) { return rejectWithValue(err?.response?.data?.message || 'Create group failed'); }
});

// ✅ עדכון קבוצה – תואם לשרת שלך (PUT)
export const updateGroup = createAsyncThunk(
  'groups/update',
  async ({ groupId, patch }, { rejectWithValue }) => {
    try {
      // סינון שדות ריקים
      const clean = Object.fromEntries(
        Object.entries(patch).filter(([_, v]) => v !== '' && v !== undefined && v !== null)
      );
      const { data } = await http.put(`/groups/${groupId}`, clean);
      return data;
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || 'Failed to update group');
    }
  }
);

/* ===== Slice ===== */

const groupsSlice = createSlice({
  name: 'groups',
  initialState: {
    list: [],
    selectedGroup: null,

    loading: false,
    error: null,

    createLoading: false,
    createError: null,
    justCreated: null,

    updateLoading: false,
    updateError: null,
    updateSuccess: false,
  },
  reducers: {
    clearCreateState(state) {
      state.createLoading = false;
      state.createError = null;
      state.justCreated = null;
    },
    clearUpdateState(state) {
      state.updateLoading = false;
      state.updateError = null;
      state.updateSuccess = false;
    }
  },
  extraReducers: (b) => {
    b
      // fetch all
      .addCase(fetchGroups.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(fetchGroups.fulfilled, (s, a) => { s.loading = false; s.list = a.payload; })
      .addCase(fetchGroups.rejected, (s, a) => { s.loading = false; s.error = a.payload; })

      // fetch one
      .addCase(fetchGroupOnly.pending, (s) => { s.loading = true; s.error = null; s.selectedGroup = null; })
      .addCase(fetchGroupOnly.fulfilled, (s, a) => { s.loading = false; s.selectedGroup = a.payload; })
      .addCase(fetchGroupOnly.rejected, (s, a) => { s.loading = false; s.error = a.payload; })

      // create
      .addCase(createGroup.pending, (s) => { s.createLoading = true; s.createError = null; s.justCreated = null; })
      .addCase(createGroup.fulfilled, (s, a) => { s.createLoading = false; s.justCreated = a.payload; s.list.unshift(a.payload); })
      .addCase(createGroup.rejected, (s, a) => { s.createLoading = false; s.createError = a.payload; })

      // ✅ update
      .addCase(updateGroup.pending, (s) => { s.updateLoading = true; s.updateError = null; s.updateSuccess = false; })
      .addCase(updateGroup.fulfilled, (s, a) => {
        s.updateLoading = false; s.updateSuccess = true;
        const g = a.payload;
        const idx = s.list.findIndex(x => String(x._id) === String(g._id));
        if (idx >= 0) s.list[idx] = g;
        if (s.selectedGroup && String(s.selectedGroup._id) === String(g._id)) s.selectedGroup = g;
      })
      .addCase(updateGroup.rejected, (s, a) => { s.updateLoading = false; s.updateError = a.payload; });
  }
});

export const { clearCreateState, clearUpdateState } = groupsSlice.actions;
export default groupsSlice.reducer;

/* ===== Selectors (כמו אצלך) ===== */

const selectMyEmail = (s) => s.auth.userEmail || null;
const selectMyId = (s) => s.auth.userId || null;

const getCreatorEmail = (g) => {
  const cand = g?.createdBy ?? g?.created_by ?? g?.createdByEmail ?? g?.ownerEmail ?? g?.owner;
  return (typeof cand === 'string') ? cand.trim().toLowerCase() : null;
};
const isOwnerByClient = (g, myEmail, myUserId) => {
  const me = (myEmail || '').trim().toLowerCase();
  const emailMatch = !!(getCreatorEmail(g) && me && getCreatorEmail(g) === me);
  const idMatch = !emailMatch && g?.createdById && myUserId && String(g.createdById) === String(myUserId);
  return !!(emailMatch || idMatch);
};

export const selectGroupsWithOwnership = createSelector(
  (s) => s.groups.list, selectMyEmail, selectMyId,
  (groups, userEmail, userId) => (groups || []).map(g => (
    typeof g?.isOwner === 'boolean' ? g : ({ ...g, isOwner: isOwnerByClient(g, userEmail, userId) })
  ))
);

export const selectSelectedGroupWithOwnership = createSelector(
  (s) => s.groups.selectedGroup, selectMyEmail, selectMyId,
  (g, userEmail, userId) => {
    if (!g) return null;
    if (typeof g?.isOwner === 'boolean') return g;
    return { ...g, isOwner: isOwnerByClient(g, userEmail, userId) };
  }
);
