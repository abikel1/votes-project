import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import http from '../api/http';
import { fetchUsersByIds, hydrateUsersForGroup, selectUsersMap } from './usersSlice';

/* ===== Helpers ===== */
const pickId = (m) => {
  if (!m) return null;
  if (typeof m === 'string') return m;
  return m._id || m.id || m.userId || m.dbId || null;
};
const coalesceName = (u) => {
  if (!u || typeof u !== 'object') return null;
  const parts =
    (u.firstName && u.lastName) ? `${u.firstName} ${u.lastName}` :
      (u.first_name && u.last_name) ? `${u.first_name} ${u.last_name}` : null;
  const candidates = [u.name, u.fullName, u.full_name, u.username, u.displayName, u.display_name, parts, u.email];
  const found = candidates?.find(v => typeof v === 'string' && v.trim());
  return found || null;
};
const normalizeGroup = (g) => g;

/* ===== Thunks ===== */
export const fetchGroups = createAsyncThunk('groups/fetchAll', async (_, { rejectWithValue }) => {
  try { const { data } = await http.get('/groups'); return data; }
  catch (err) { return rejectWithValue(err?.response?.data?.message || 'Failed to load groups'); }
});

export const fetchGroupOnly = createAsyncThunk('groups/fetchOnly', async (groupId, { rejectWithValue }) => {
  try { const { data } = await http.get(`/groups/${groupId}`); return data; }
  catch (err) { return rejectWithValue(err?.response?.data?.message || 'Failed to load group'); }
});

/** טען קבוצה + השלם פרטי חברים:
 *  1) fetchUsersByIds (batch/יחידני)
 *  2) אם עדיין חסר — hydrateUsersForGroup (פולבאקים לפי ראוטים חלופיים)
 */
export const fetchGroupWithMembers = createAsyncThunk(
  'groups/fetchWithMembers',
  async (groupId, { dispatch, rejectWithValue, getState }) => {
    try {
      const group = await dispatch(fetchGroupOnly(groupId)).unwrap();
      const ids = (Array.isArray(group?.members) ? group.members : []).map(pickId).filter(Boolean);

      if (ids.length) {
        await dispatch(fetchUsersByIds(ids));      // לא מפיל על 404
        const afterBatch = getState().users?.byId || {};
        const missing = ids.filter(id => !afterBatch[String(id)]);
        if (missing.length) {
          await dispatch(hydrateUsersForGroup({ groupId })); // מנסה /groups/:id/members וכו'
        }
      }
      return group;
    } catch (err) {
      return rejectWithValue(err?.message || err);
    }
  }
);

export const createGroup = createAsyncThunk('groups/create', async (payload, { rejectWithValue }) => {
  try { const { data } = await http.post('/groups/create', payload); return data; }
  catch (err) { return rejectWithValue(err?.response?.data?.message || 'Create group failed'); }
});

export const updateGroup = createAsyncThunk(
  'groups/update',
  async ({ groupId, patch }, { rejectWithValue }) => {
    try {
      const clean = Object.fromEntries(Object.entries(patch).filter(([_, v]) => v !== '' && v !== undefined && v !== null));
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
    clearCreateState(state) { state.createLoading = false; state.createError = null; state.justCreated = null; },
    clearUpdateState(state) { state.updateLoading = false; state.updateError = null; state.updateSuccess = false; },
  },
  extraReducers: (b) => {
    b
      .addCase(fetchGroups.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(fetchGroups.fulfilled, (s, a) => { s.loading = false; s.list = a.payload.map(normalizeGroup); })
      .addCase(fetchGroups.rejected, (s, a) => { s.loading = false; s.error = a.payload; })

      .addCase(fetchGroupOnly.pending, (s) => { s.loading = true; s.error = null; s.selectedGroup = null; })
      .addCase(fetchGroupOnly.fulfilled, (s, a) => { s.loading = false; s.selectedGroup = normalizeGroup(a.payload); })
      .addCase(fetchGroupOnly.rejected, (s, a) => { s.loading = false; s.error = a.payload; })

      .addCase(fetchGroupWithMembers.pending, (s) => { s.loading = true; s.error = null; s.selectedGroup = null; })
      .addCase(fetchGroupWithMembers.fulfilled, (s, a) => { s.loading = false; s.selectedGroup = normalizeGroup(a.payload); })
      .addCase(fetchGroupWithMembers.rejected, (s, a) => { s.loading = false; s.error = a.payload; })

      .addCase(updateGroup.pending, (s) => { s.updateLoading = true; s.updateError = null; s.updateSuccess = false; })
      .addCase(updateGroup.fulfilled, (s, a) => {
        s.updateLoading = false; s.updateSuccess = true;
        const g = normalizeGroup(a.payload);
        const idx = s.list.findIndex(x => String(x._id) === String(g._id));
        if (idx >= 0) s.list[idx] = g;
        if (s.selectedGroup && String(s.selectedGroup._id) === String(g._id)) s.selectedGroup = g;
      })
      .addCase(updateGroup.rejected, (s, a) => { s.updateLoading = false; s.updateError = a.payload; });
  }
});

export const { clearCreateState, clearUpdateState } = groupsSlice.actions;
export default groupsSlice.reducer;

/* ===== Selectors ===== */
export const selectSelectedGroup = (s) => s.groups.selectedGroup;

export const selectSelectedGroupMembersEnriched = createSelector(
  [selectSelectedGroup, selectUsersMap],
  (group, usersById) => {
    const members = Array.isArray(group?.members) ? group.members : [];
    return members.map((m) => {
      const id = pickId(m);
      const fromUsers = id ? usersById[String(id)] : null;
      const merged = { ...(typeof m === 'object' ? m : {}), ...(fromUsers || {}) };
      const name = coalesceName(merged) || id || '(ללא שם)';
      return { ...merged, _id: merged._id || id, name };
    });
  }
);
