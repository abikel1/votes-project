import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import http from '../api/http';

/* ======================
   Thunks
   ====================== */

export const fetchGroups = createAsyncThunk('groups/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const res = await http.get('/groups');          // ← חייב באותה שורה!
    return res.data;
  } catch (err) {
    return rejectWithValue(err?.response?.data?.message || 'Failed to load groups');
  }
});

// טוען קבוצה בודדת + מועמדים שלה
export const fetchGroupWithCandidates = createAsyncThunk(
  'groups/fetchOne',
  async (groupId, { rejectWithValue }) => {
    try {
      const [gRes, cRes] = await Promise.all([
        http.get(`/groups/${groupId}`),
        http.get(`/candidates/group/${groupId}`),
      ]);
      return { group: gRes.data, candidates: Array.isArray(cRes.data) ? cRes.data : [] };
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || 'Failed to load group or candidates');
    }
  }
);

// יצירת קבוצה
export const createGroup = createAsyncThunk('groups/create', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await http.post('/groups/create', payload);
    return data;
  } catch (err) {
    return rejectWithValue(err?.response?.data?.message || 'Create group failed');
  }
});

export const addCandidateToGroup = createAsyncThunk(
  'groups/addCandidate',
  async ({ groupId, userId }, { rejectWithValue }) => {
    try {
      const { data } = await http.post('/candidates', { groupId, userId });
      return { groupId, candidate: data };
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || 'Failed to add candidate');
    }
  }
);

export const removeCandidateFromGroup = createAsyncThunk(
  'groups/removeCandidate',
  async ({ candidateId }, { rejectWithValue }) => {
    try {
      await http.delete(`/candidates/${candidateId}`);
      return { candidateId };
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || 'Failed to remove candidate');
    }
  }
);

export const fetchGroupMembers = createAsyncThunk(
  'groups/fetchMembers',
  async (groupId, { rejectWithValue }) => {
    try {
      const { data } = await http.get(`/groups/${groupId}/members`);
      return { groupId, members: Array.isArray(data) ? data : [] };
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || 'Failed to load members');
    }
  }
);

export const addMemberToGroup = createAsyncThunk(
  'groups/addMember',
  async ({ groupId, userId }, { rejectWithValue }) => {
    try {
      const { data } = await http.post(`/groups/${groupId}/members`, { userId });
      return { groupId, member: data };
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || 'Failed to add member');
    }
  }
);

export const removeMemberFromGroup = createAsyncThunk(
  'groups/removeMember',
  async ({ groupId, memberId }, { rejectWithValue }) => {
    try {
      await http.delete(`/groups/${groupId}/members/${memberId}`);
      return { memberId };
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || 'Failed to remove member');
    }
  }
);

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
    candidates: [],
    members: [],
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
      // claim ownership
      .addCase(claimGroupOwnership.pending, (s) => {
        s.claimLoading = true; s.claimError = null;
      })
      .addCase(claimGroupOwnership.fulfilled, (s, a) => {
        s.claimLoading = false;
        const g = a.payload;
        const idx = s.list.findIndex(x => String(x._id) === String(g._id));
        if (idx >= 0) s.list[idx] = g;
        if (s.selectedGroup && String(s.selectedGroup._id) === String(g._id)) {
          s.selectedGroup = g;
        }
      })
      .addCase(claimGroupOwnership.rejected, (s, a) => {
        s.claimLoading = false; s.claimError = a.payload;
      })

      // fetch members
      .addCase(fetchGroupMembers.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(fetchGroupMembers.fulfilled, (s, a) => { s.loading = false; s.members = a.payload.members; })
      .addCase(fetchGroupMembers.rejected, (s, a) => { s.loading = false; s.error = a.payload; })

      // candidates
      .addCase(addCandidateToGroup.fulfilled, (s, a) => {
        const c = a.payload.candidate;
        if (c) s.candidates.unshift(c);
      })
      .addCase(removeCandidateFromGroup.fulfilled, (s, a) => {
        s.candidates = s.candidates.filter(x => String(x._id) !== String(a.payload.candidateId));
      })

      // members
      .addCase(addMemberToGroup.fulfilled, (s, a) => {
        const m = a.payload.member;
        if (m) s.members.unshift(m);
      })
      .addCase(removeMemberFromGroup.fulfilled, (s, a) => {
        s.members = s.members.filter(x => String(x._id) !== String(a.payload.memberId));
      })

      // fetch groups
      .addCase(fetchGroups.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchGroups.fulfilled, (state, action) => { state.loading = false; state.list = action.payload; })
      .addCase(fetchGroups.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      // fetch one + candidates
      .addCase(fetchGroupWithCandidates.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchGroupWithCandidates.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedGroup = action.payload.group;
        state.candidates = action.payload.candidates;
      })
      .addCase(fetchGroupWithCandidates.rejected, (state, action) => {
        state.loading = false; state.error = action.payload;
      })

      // create group
      .addCase(createGroup.pending, (state) => {
        state.createLoading = true; state.createError = null; state.justCreated = null;
      })
      .addCase(createGroup.fulfilled, (state, action) => {
        state.createLoading = false;
        state.justCreated = action.payload;
        if (Array.isArray(state.list)) state.list.unshift(action.payload);
      })
      .addCase(createGroup.rejected, (state, action) => {
        state.createLoading = false; state.createError = action.payload;
      });
  },
});

export const { clearCreateState } = groupsSlice.actions;
export default groupsSlice.reducer;

/* ======================
   Selectors: compute ownership robustly (email first, then id)
   ====================== */

// אימייל/מזהה מה-auth
const selectMyEmail = (s) => s.auth.userEmail || null;
const selectMyId    = (s) => s.auth.userId || null;

// חילוץ אימייל היוצר (מכסה וריאנטים)
const getCreatorEmail = (g) => {
  const cand =
    g?.createdBy ??
    g?.created_by ??
    g?.createdByEmail ??
    g?.ownerEmail ??
    g?.owner;
  return (typeof cand === 'string') ? cand.trim().toLowerCase() : null;
};

// חישוב בעלות
const isOwnerByClient = (g, myEmail, myUserId) => {
  const groupEmail = getCreatorEmail(g);
  const meEmail    = (myEmail || '').trim().toLowerCase();

  const emailMatch = !!(groupEmail && meEmail && groupEmail === meEmail);
  const idMatch    = !emailMatch && g?.createdById && myUserId &&
                     String(g.createdById) === String(myUserId);

  return !!(emailMatch || idMatch);
};

// רשימת קבוצות מועשרת
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

// קבוצה נבחרת מועשרת
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
