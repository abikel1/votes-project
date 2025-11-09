import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import http from '../api/http';

// משתמש מגיש בקשת הצטרפות
export const requestJoinGroup = createAsyncThunk(
    'joinReq/requestJoinGroup',
    async (groupId, { rejectWithValue }) => {
        try {
            const { data } = await http.post(`/groups/${groupId}/join`);
            return { groupId, group: data };
        } catch (err) {
            return rejectWithValue(err?.response?.data?.message || 'בקשת הצטרפות נכשלה');
        }
    }
);

// מנהל רואה רשימת בקשות (מוחזרות רק pending מהשרת)
export const fetchJoinRequests = createAsyncThunk(
    'joinReq/fetchJoinRequests',
    async (groupId, { rejectWithValue }) => {
        try {
            const { data } = await http.get(`/groups/${groupId}/requests`);
            return { groupId, requests: data };
        } catch (err) {
            return rejectWithValue(err?.response?.data?.message || 'כשל בקריאת בקשות');
        }
    }
);

// מנהל מאשר בקשה
export const approveJoinRequest = createAsyncThunk(
    'joinReq/approve',
    async ({ groupId, requestId }, { rejectWithValue }) => {
        try {
            // השרת מחזיר { ok:true, pending:[...] } לפי העדכון
            const { data } = await http.patch(`/groups/${groupId}/requests/${requestId}/approve`);
            return { groupId, requestId, response: data };
        } catch (err) {
            return rejectWithValue(err?.response?.data?.message || 'כשל באישור בקשה');
        }
    }
);

// מנהל דוחה בקשה
export const rejectJoinRequest = createAsyncThunk(
    'joinReq/reject',
    async ({ groupId, requestId }, { rejectWithValue }) => {
        try {
            const { data } = await http.patch(`/groups/${groupId}/requests/${requestId}/reject`);
            return { groupId, requestId, response: data };
        } catch (err) {
            return rejectWithValue(err?.response?.data?.message || 'כשל בדחיית בקשה');
        }
    }
);

const joinReqSlice = createSlice({
    name: 'joinReq',
    initialState: {
        byGroup: {},     // groupId -> { loading, error, list: [] }
        actionError: null,
    },
    reducers: {
        clearJoinRequestsError(s) { s.actionError = null; }
    },
    extraReducers: (b) => {
        b
            // טעינה
            .addCase(fetchJoinRequests.pending, (s, a) => {
                const g = a.meta.arg;
                s.byGroup[g] = { loading: true, error: null, list: s.byGroup[g]?.list || [] };
            })
            // הצלחה
            .addCase(fetchJoinRequests.fulfilled, (s, a) => {
                const { groupId, requests } = a.payload;
                const onlyPending = (Array.isArray(requests) ? requests : []).filter(r => r?.status === 'pending');
                s.byGroup[groupId] = { loading: false, error: null, list: onlyPending };
            })
            // שגיאה
            .addCase(fetchJoinRequests.rejected, (s, a) => {
                const g = a.meta.arg;
                s.byGroup[g] = { loading: false, error: a.payload, list: [] };
            })

            // אישור בקשה
            .addCase(approveJoinRequest.fulfilled, (s, a) => {
                const { groupId, requestId, response } = a.payload;
                const st = s.byGroup[groupId];
                if (!st) return;
                if (Array.isArray(response?.pending)) {
                    st.list = response.pending.filter(r => r?.status === 'pending');
                } else {
                    st.list = (st.list || []).filter(r => r._id !== requestId);
                }
            })

            // דחיית בקשה
            .addCase(rejectJoinRequest.fulfilled, (s, a) => {
                const { groupId, requestId, response } = a.payload;
                const st = s.byGroup[groupId];
                if (!st) return;
                if (Array.isArray(response?.pending)) {
                    st.list = response.pending.filter(r => r?.status === 'pending');
                } else {
                    st.list = (st.list || []).filter(r => r._id !== requestId);
                }
            })

            // שגיאות כלליות
            .addCase(approveJoinRequest.rejected, (s, a) => { s.actionError = a.payload; })
            .addCase(rejectJoinRequest.rejected, (s, a) => { s.actionError = a.payload; })
            .addCase(requestJoinGroup.rejected, (s, a) => { s.actionError = a.payload; });
    }
});

export const { clearJoinRequestsError } = joinReqSlice.actions;
export default joinReqSlice.reducer;

export const selectJoinRequestsForGroup = (groupId) => (s) => s.joinReq.byGroup[groupId]?.list || [];
export const selectJoinRequestsLoading = (groupId) => (s) => !!s.joinReq.byGroup[groupId]?.loading;
export const selectJoinRequestsError = (groupId) => (s) => s.joinReq.byGroup[groupId]?.error || null;
export const selectJoinActionError = (s) => s.joinReq.actionError;
