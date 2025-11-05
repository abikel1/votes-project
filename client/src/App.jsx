import { Routes, Route, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from './slices/authSlice';
import GroupsPage from './pages/GroupList/GroupsPage.jsx';

import RegisterPage from './pages/RegisterPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import UsersPage from './pages/UsersPage.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import GroupCandidatesPage from './components/GroupCandidatesPage.jsx';

export default function App() {
  const dispatch = useDispatch();
  const token = useSelector(s => s.auth.token);

  return (
    <div style={{ padding: 16 }}>
      <nav style={{ display: 'flex', gap: 12 }}>
        <Link to="/register">הרשמה</Link>
        <Link to="/login">התחברות</Link>
        <Link to="/me">פרופיל</Link>
        <Link to="/users">משתמשים</Link>
        <Link to="/groups">קבוצות</Link>
        {token && <button onClick={() => dispatch(logout())}>Logout</button>}
      </nav>

      <Routes>
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/groups/:groupId/candidates" element={<GroupCandidatesPage />} />
        <Route path="/groups" element={<GroupsPage />} />
        <Route path="/me" element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        } />

        <Route path="/users" element={<UsersPage />} />
      </Routes>
    </div>
  );
}
