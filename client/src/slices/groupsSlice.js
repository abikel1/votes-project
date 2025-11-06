// client/src/slices/groupsSlice.js
import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import http from '../api/http';

/* ======================
   Thunks
   ====================== */

// כל הקבוצות
export const fetchGroups = createAsyncThunk('groups/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const res = await http.get('/groups');
    return res.data;
  } catch (err) {
    return rejectWithValue(err?.response?.data?.message || 'Failed to load groups');
  }
});



// יצירת קבוצה
export const createGroup = createAsyncThunk('groups/create', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await http.post('/groups/create', payload);
    return data;
  } catch (err) {
    return rejectWithValue(err?.response?.data?.message || 'Create group failed');
  }
});

// תביעת בעלות (לקבוצות ישנות ללא createdById)
export const claimGroupOwnership = createAsyncThunk(
  'groups/claimOwnership',
  async (groupId, { rejectWithValue }) => {
    try {
      const { data } = await http.patch(`/groups/${groupId}/claim`);
      return data; // אובייקט קבוצה מעודכן
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || 'Failed to claim ownership');
    }
  }
);

/* ======================
   Slice
   ====================== */

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

    claimLoading: false,
    claimError: null,
  },
  reducers: {
    clearCreateState(state) {
      state.createLoading = false;
      state.createError = null;
      state.justCreated = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // fetch all
      .addCase(fetchGroups.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(fetchGroups.fulfilled, (s, a) => { s.loading = false; s.list = a.payload; })
      .addCase(fetchGroups.rejected, (s, a) => { s.loading = false; s.error = a.payload; })

      // fetch one (only group)
      .addCase(fetchGroupOnly.pending, (s) => { s.loading = true; s.error = null; s.selectedGroup = null; })
      .addCase(fetchGroupOnly.fulfilled, (s, a) => { s.loading = false; s.selectedGroup = a.payload; })
      .addCase(fetchGroupOnly.rejected, (s, a) => { s.loading = false; s.error = a.payload; })

      // create
      .addCase(createGroup.pending, (s) => { s.createLoading = true; s.createError = null; s.justCreated = null; })
      .addCase(createGroup.fulfilled, (s, a) => {
        s.createLoading = false;
        s.justCreated = a.payload;
        if (Array.isArray(s.list)) s.list.unshift(a.payload);
      })
      .addCase(createGroup.rejected, (s, a) => { s.createLoading = false; s.createError = a.payload; })

      // claim ownership
      .addCase(claimGroupOwnership.pending, (s) => { s.claimLoading = true; s.claimError = null; })
      .addCase(claimGroupOwnership.fulfilled, (s, a) => {
        s.claimLoading = false;
        const g = a.payload;
        const idx = s.list.findIndex(x => String(x._id) === String(g._id));
        if (idx >= 0) s.list[idx] = g;
        if (s.selectedGroup && String(s.selectedGroup._id) === String(g._id)) s.selectedGroup = g;
      })
      .addCase(claimGroupOwnership.rejected, (s, a) => { s.claimLoading = false; s.claimError = a.payload; });
  },
});

export const { clearCreateState } = groupsSlice.actions;
export default groupsSlice.reducer;

/* ======================
   Selectors: compute ownership robustly (email first, then id)
   ====================== */

const selectMyEmail = (s) => s.auth.userEmail || null;
const selectMyId = (s) => s.auth.userId || null;

const getCreatorEmail = (g) => {
  const cand = g?.createdBy ?? g?.created_by ?? g?.createdByEmail ?? g?.ownerEmail ?? g?.owner;
  return (typeof cand === 'string') ? cand.trim().toLowerCase() : null;
};

const isOwnerByClient = (g, myEmail, myUserId) => {
  const groupEmail = getCreatorEmail(g);
  const meEmail = (myEmail || '').trim().toLowerCase();
  const emailMatch = !!(groupEmail && meEmail && groupEmail === meEmail);
  const idMatch = !emailMatch && g?.createdById && myUserId &&
    String(g.createdById) === String(myUserId);
  return !!(emailMatch || idMatch);
};

export const selectGroupsWithOwnership = createSelector(
  (s) => s.groups.list,
  selectMyEmail,
  selectMyId,
  (groups, userEmail, userId) =>
    (groups || []).map(g => {
      if (typeof g?.isOwner === 'boolean') return g;
      return { ...g, isOwner: isOwnerByClient(g, userEmail, userId) };
    })
);

export const selectSelectedGroupWithOwnership = createSelector(
  (s) => s.groups.selectedGroup,
  selectMyEmail,
  selectMyId,
  (g, userEmail, userId) => {
    if (!g) return null;
    if (typeof g?.isOwner === 'boolean') return g;
    return { ...g, isOwner: isOwnerByClient(g, userEmail, userId) };
  }
);

export const fetchGroupOnly = createAsyncThunk('groups/fetchOnly', async (groupId, { rejectWithValue }) => {
  try {
    const { data } = await http.get(`/groups/${groupId}`);
    return data;
  } catch (err) {
    return rejectWithValue(err?.response?.data?.message || 'Failed to load group');
  }
});

