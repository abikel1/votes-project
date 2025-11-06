// client/src/slices/groupsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import http from '../api/http';

// === פעולות אסינכרוניות ===

// טוען את כל הקבוצות
export const fetchGroups = createAsyncThunk('groups/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const res = await http.get('/groups');
    return res.data;
  } catch (err) {
    return rejectWithValue(err?.response?.data?.message || 'Failed to load groups');
  }
});

// טוען קבוצה בודדת + מועמדים שלה
export const fetchGroupWithCandidates = createAsyncThunk('groups/fetchOne', async (groupId, { rejectWithValue }) => {
  try {
    const [gRes, cRes] = await Promise.all([
      http.get(`/groups/${groupId}`),
      http.get(`/candidates/group/${groupId}`),
    ]);
    return { group: gRes.data, candidates: Array.isArray(cRes.data) ? cRes.data : [] };
  } catch (err) {
    return rejectWithValue(err?.response?.data?.message || 'Failed to load group or candidates');
  }
});


// === ה־slice עצמו ===

const groupsSlice = createSlice({
  name: 'groups',
  initialState: {
    list: [],            // כל הקבוצות
    selectedGroup: null, // קבוצה ספציפית
    candidates: [],      // מועמדים של הקבוצה הנבחרת
    loading: false,
    error: null,
  },
  reducers: {},

  extraReducers: (builder) => {
    builder

      // === fetchGroups ===
      .addCase(fetchGroups.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGroups.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchGroups.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // === fetchGroupWithCandidates ===
      .addCase(fetchGroupWithCandidates.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGroupWithCandidates.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedGroup = action.payload.group;
        state.candidates = action.payload.candidates;
      })
      .addCase(fetchGroupWithCandidates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default groupsSlice.reducer;
