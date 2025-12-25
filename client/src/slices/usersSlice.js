import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import http from '../api/http';
import i18n from '../i18n';

const asId = (u, fallback) => String(u?._id ?? u?.id ?? u?.userId ?? fallback ?? '');
const toMapById = (arr) => {
  const out = {};
  (Array.isArray(arr) ? arr : []).forEach(u => {
    const id = asId(u);
    if (id) out[id] = u;
  });
  return out;
};

export const fetchUsersByIds = createAsyncThunk(
  'users/fetchByIds',
  async (ids, { rejectWithValue }) => {
    try {
      const uniq = Array.from(new Set((ids || []).filter(Boolean).map(String)));
      if (!uniq.length) return {};
      try {
        const { data } = await http.get('/users/batch', { params: { ids: uniq.join(',') } });
        return toMapById(data);
      } catch {
        const results = await Promise.all(
          uniq.map(async (id) => {
            try {
              const { data } = await http.get(`/users/${id}`);
              return data;
            } catch {
              return null;
            }
          })
        );
        return toMapById(results.filter(Boolean));
      }
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message || i18n.t('users.loadFailed')
      );
    }
  }
);

export const hydrateUsersForGroup = createAsyncThunk(
  'users/hydrateForGroup',
  async ({ groupId }, { rejectWithValue }) => {
    try {
      const probes = [
        `/groups/${groupId}/members`,
        `/group/${groupId}/members`,
        `/members?groupId=${groupId}`,
      ];
      for (const url of probes) {
        try {
          const { data } = await http.get(url);
          const map = toMapById(data);
          if (Object.keys(map).length) return map;
        } catch (_) {
        }
      }
      return {};
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message || i18n.t('users.hydrateFailed')
      );
    }
  }
);

const usersSlice = createSlice({
  name: 'users',
  initialState: {
    byId: {},
    loading: false,
    error: null,
  },
  reducers: {
    upsertUsers(state, action) {
      const arr = Array.isArray(action.payload) ? action.payload : [action.payload];
      arr.forEach((u) => {
        const id = asId(u);
        if (!id) return;
        state.byId[id] = { ...(state.byId[id] || {}), ...u };
      });
    },
  },
  extraReducers: (b) => {
    b
      .addCase(fetchUsersByIds.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(fetchUsersByIds.fulfilled, (s, a) => {
        s.loading = false;
        s.byId = { ...s.byId, ...a.payload };
      })
      .addCase(fetchUsersByIds.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      })

      .addCase(hydrateUsersForGroup.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(hydrateUsersForGroup.fulfilled, (s, a) => {
        s.loading = false;
        s.byId = { ...s.byId, ...a.payload };
      })
      .addCase(hydrateUsersForGroup.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      });
  }
});

export const { upsertUsers } = usersSlice.actions;
export default usersSlice.reducer;
export const selectUsersMap = (s) => s.users.byId || {};
