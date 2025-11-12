// src/slices/joinRequestsSlice.js (בלי שינוי לוגיקה – הושאר כמו אצלך)
import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import http from '../api/http';

/* ===== LocalStorage helpers ===== */
const LS_KEY = 'join_pending_groups';
const LS_REMOVED = 'removed_by_owner_groups'; // { [groupId]: timestamp }

function loadPendingFromLS() {
    try {
        const raw = localStorage.getItem(LS_KEY);
        if (!raw) return new Set();
        const arr = JSON.parse(raw);
        if (!Array.isArray(arr)) return new Set();
        return new Set(arr.map(String));
    } catch { return new Set(); }
}
function savePendingToLS(pendingSet) {
    try { localStorage.setItem(LS_KEY, JSON.stringify(Array.from(pendingSet))); }
    catch { }
}

function loadRemovedMap() {
    try {
        const raw = localStorage.getItem(LS_REMOVED);
        if (!raw) return {};
        const obj = JSON.parse(raw);
        return (obj && typeof obj === 'object') ? obj : {};
    } catch { return {}; }
}
function saveRemovedMap(map) {
    try { localStorage.setItem(LS_REMOVED, JSON.stringify(map || {})); } catch { }
}

/* ===== Thunks ===== */

// שליחת בקשת הצטרפות — חסום אם לא מחוברים (כדי למנוע 401)
export const requestJoinGroup = createAsyncThunk(
    'joinReq/requestJoinGroup',
    async (groupId, { getState, rejectWithValue }) => {
        const { auth } = getState();
        const isAuthed = !!auth?.userId || !!auth?.userEmail || !!localStorage.getItem('authToken');
        if (!isAuthed) {
            // לא נשלחת בקשה לשרת כלל
            return rejectWithValue('AUTH_REQUIRED');
        }
        try {
            const { data } = await http.post(`/groups/${groupId}/join`);
            return { groupId: String(groupId), group: data };
        } catch (err) {
            return rejectWithValue(err?.response?.data?.message || 'בקשת הצטרפות נכשלה');
        }
    }
);

// סטטוסים ממתינים שלי מהשרת
export const fetchMyJoinStatuses = createAsyncThunk(
    'joinReq/fetchMyStatuses',
    async (_, { rejectWithValue }) => {
        try {
            // צפי: { pending: string[] }
            const { data } = await http.get('/groups/my-join-status');
            return data;
        } catch (err) {
            return rejectWithValue(err?.response?.data?.message || 'כשל בטעינת סטטוסי הצטרפות');
        }
    }
);

// (לבעלי קבוצה) רשימת בקשות לקבוצה
export const fetchJoinRequests = createAsyncThunk(
    'joinReq/fetchJoinRequests',
    async (groupId, { rejectWithValue }) => {
        try {
            const { data } = await http.get(`/groups/${groupId}/requests`);
            return { groupId: String(groupId), requests: data };
        } catch (err) {
            return rejectWithValue(err?.response?.data?.message || 'כשל בקריאת בקשות');
        }
    }
);

// (לבעלי קבוצה) אישור/דחייה
export const approveJoinRequest = createAsyncThunk(
    'joinReq/approve',
    async ({ groupId, requestId }, { rejectWithValue }) => {
        try {
            const { data } = await http.patch(`/groups/${groupId}/requests/${requestId}/approve`);
            return { groupId: String(groupId), requestId, response: data };
        } catch (err) {
            return rejectWithValue(err?.response?.data?.message || 'כשל באישור בקשה');
        }
    }
);

export const rejectJoinRequest = createAsyncThunk(
    'joinReq/reject',
    async ({ groupId, requestId }, { rejectWithValue }) => {
        try {
            const { data } = await http.patch(`/groups/${groupId}/requests/${requestId}/reject`);
            return { groupId: String(groupId), requestId, response: data };
        } catch (err) {
            return rejectWithValue(err?.response?.data?.message || 'כשל בדחיית בקשה');
        }
    }
);

/* ===== Slice ===== */

const joinReqSlice = createSlice({
    name: 'joinReq',
    initialState: {
        byGroup: {},
        actionError: null,
        // [groupId]: { requesting, status: 'none'|'pending'|'member'|'rejected'|'error', error?, rejectedAt? }
        my: {},
        removedNotice: loadRemovedMap(), // { [groupId]: timestamp } מי שסומן כהוסר
    },
    reducers: {
        clearJoinRequestsError(s) { s.actionError = null; },

        hydratePendingFromLocalStorage(s) {
            const set = loadPendingFromLS();
            set.forEach((gid) => {
                const prev = s.my[gid] || {};
                s.my[gid] = { ...prev, requesting: false, status: 'pending', error: null };
            });
        },

        markJoinedLocally(s, a) {
            const gid = String(a.payload);
            s.my[gid] = { requesting: false, status: 'member', error: null };
            const set = loadPendingFromLS();
            if (set.has(gid)) { set.delete(gid); savePendingToLS(set); }
            // אם היה דגל "הוסרת" — ננקה אותו
            if (s.removedNotice[gid]) { delete s.removedNotice[gid]; saveRemovedMap(s.removedNotice); }
        },

        // לנקות הודעת "הוסרת" ידנית (למשל אחרי SEND שוב)
        clearRemovedNotice(s, a) {
            const gid = String(a.payload);
            if (s.removedNotice[gid]) { delete s.removedNotice[gid]; saveRemovedMap(s.removedNotice); }
        },

        // איפוס דגל "נדחה" — אם רוצים לנקות ידנית
        clearRejectedForGroup(s, a) {
            const gid = String(a.payload);
            const prev = s.my[gid] || {};
            if (prev.status === 'rejected') {
                s.my[gid] = { requesting: false, status: 'none', error: null };
            }
        },
    },
    extraReducers: (b) => {
        b
            /* ===== בעלי קבוצה ===== */
            .addCase(fetchJoinRequests.pending, (s, a) => {
                const g = String(a.meta.arg);
                s.byGroup[g] = { loading: true, error: null, list: s.byGroup[g]?.list || [] };
            })
            .addCase(fetchJoinRequests.fulfilled, (s, a) => {
                const { groupId, requests } = a.payload;
                s.byGroup[groupId] = {
                    loading: false,
                    error: null,
                    list: (Array.isArray(requests) ? requests : []).filter(r => r?.status === 'pending'),
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
                    st.list = response.pending.filter(r => r?.status === 'pending');
                } else {
                    st.list = (st.list || []).filter(r => r._id !== requestId);
                }
            })
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
            .addCase(approveJoinRequest.rejected, (s, a) => { s.actionError = a.payload; })
            .addCase(rejectJoinRequest.rejected, (s, a) => { s.actionError = a.payload; })

            /* ===== הזרימה שלי ===== */
            .addCase(requestJoinGroup.pending, (s, a) => {
                const gid = String(a.meta.arg);
                // אם היה rejected – נעבור מייד ל-pending ונאפס rejectedAt
                s.my[gid] = { requesting: true, status: 'pending', error: null };
                const set = loadPendingFromLS(); set.add(gid); savePendingToLS(set);
                if (s.removedNotice[gid]) { delete s.removedNotice[gid]; saveRemovedMap(s.removedNotice); }
            })
            .addCase(requestJoinGroup.fulfilled, (s, a) => {
                const gid = String(a.payload.groupId);
                s.my[gid] = { requesting: false, status: 'pending', error: null };
            })
            .addCase(requestJoinGroup.rejected, (s, a) => {
                const gid = String(a.meta.arg);
                // אם נדחינו כי לא מחוברים — לא נרצה להשאיר מצב error רועש
                if (a.payload === 'AUTH_REQUIRED') {
                    s.my[gid] = { requesting: false, status: 'none', error: null };
                    return;
                }
                s.my[gid] = { requesting: false, status: 'error', error: a.payload || 'בקשה נכשלה' };
                s.actionError = a.payload;
                const set = loadPendingFromLS();
                if (set.has(gid)) { set.delete(gid); savePendingToLS(set); }
            })

            // ✅ “אני חבר/ה” מ־/groups/my – נסמן חבר/ה, ונוריד מי שמסומן member מקומית אבל לא מופיע בשרת.
            .addCase('groups/fetchMy/fulfilled', (s, a) => {
                const joined = Array.isArray(a.payload?.joined) ? a.payload.joined : [];
                const currentJoinedSet = new Set(joined.map(g => String(g._id)));

                const ls = loadPendingFromLS();
                for (const g of joined) {
                    const gid = String(g._id);
                    s.my[gid] = { requesting: false, status: 'member', error: null };
                    if (ls.has(gid)) ls.delete(gid);
                    if (s.removedNotice[gid]) { delete s.removedNotice[gid]; }
                }

                // אם מישהו סומן member מקומית אבל אינו חבר בשרת (הוסר) → none
                for (const [gid, st] of Object.entries(s.my)) {
                    if (st?.status === 'member' && !currentJoinedSet.has(String(gid))) {
                        s.my[gid] = { requesting: false, status: 'none', error: null };
                        s.removedNotice[gid] = Date.now();
                    }
                }

                savePendingToLS(ls);
                saveRemovedMap(s.removedNotice);
            })

            // ✅ יישור קו עם שרת לגבי pending:
            //    - מי שבשרת pending → pending
            //    - מי שאצלנו pending אבל לא בשרת → rejected
            .addCase(fetchMyJoinStatuses.fulfilled, (s, a) => {
                const ids = Array.isArray(a.payload?.pending) ? a.payload.pending.map(String) : [];
                const serverSet = new Set(ids);

                // עדכון לכל אלו שבשרת עדיין pending
                serverSet.forEach((gid) => {
                    s.my[gid] = { requesting: false, status: 'pending', error: null };
                });

                const localSet = loadPendingFromLS();
                // מי שהיה pending מקומית אך לא בשרת → נדחה
                for (const [gid, st] of Object.entries(s.my)) {
                    if (st?.status === 'pending' && !serverSet.has(String(gid))) {
                        s.my[gid] = { requesting: false, status: 'rejected', error: null, rejectedAt: Date.now() };
                        if (localSet.has(gid)) localSet.delete(gid);
                    }
                }

                // שמירת LS אחרי ניקוי הדחויים
                const union = new Set([...localSet, ...serverSet]);
                savePendingToLS(union);
            });
    }
});

export const {
    clearJoinRequestsError,
    hydratePendingFromLocalStorage,
    markJoinedLocally,
    clearRemovedNotice,
    clearRejectedForGroup,
} = joinReqSlice.actions;

export default joinReqSlice.reducer;

/* ===== Selectors ===== */
export const selectJoinRequestsForGroup = (groupId) => (s) => s.joinReq.byGroup[groupId]?.list || [];
export const selectJoinRequestsLoading = (groupId) => (s) => !!s.joinReq.byGroup[groupId]?.loading;
export const selectJoinRequestsError = (groupId) => (s) => s.joinReq.byGroup[groupId]?.error || null;

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

// סט ממואזר של קבוצות שנדחו
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

// “הוסרת”
export const selectWasRemovedFromGroup = (groupId) => (s) =>
    !!s.joinReq.removedNotice?.[String(groupId)];

// סטטוס לקבוצה
export const selectMyStatusByGroup = (groupId) => (s) =>
    s.joinReq.my?.[String(groupId)]?.status || 'none';
