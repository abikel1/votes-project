import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../slices/authSlice';
import usersReducer from '../slices/usersSlice';
import groupsReducer from '../slices/groupsSlice';
import votesReducer from '../slices/votesSlice';
import candidatesReducer from '../slices/candidateSlice'; // 👈 חדש

const store = configureStore({
    reducer: {
        auth: authReducer,
        users: usersReducer,
        groups: groupsReducer,
        votes: votesReducer,
        candidates: candidatesReducer,           // 👈 חדש
    },
    devTools: true,
});

// סנכרון הטוקן ל-localStorage (פשוט ויעיל)
let prevToken;
store.subscribe(() => {
    const token = store.getState().auth.token;
    if (token !== prevToken) {
        prevToken = token;
        if (token) localStorage.setItem('token', token);
        else localStorage.removeItem('token');
    }
});

export default store;
