import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../slices/authSlice';
import usersReducer from '../slices/usersSlice';
import groupsReducer from '../slices/groupsSlice';
import votesReducer from '../slices/votesSlice';
import candidatesReducer from '../slices/candidateSlice';
import joinReqReducer from '../slices/joinRequestsSlice';
import mailReducer from '../slices/mailSlice';

const store = configureStore({
    reducer: {
        auth: authReducer,
        users: usersReducer,
        groups: groupsReducer,
        candidates: candidatesReducer,
        votes: votesReducer,
        joinReq: joinReqReducer,
        mail: mailReducer,
    },
    devTools: true,
});

// סנכרון הטוקן ל-localStorage
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
