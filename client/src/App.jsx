import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Routes, Route } from 'react-router-dom';
import { fetchMe } from './slices/authSlice';

import GroupsPage from './pages/GroupList/GroupsPage.jsx';
import GroupSettingsPage from './components/GroupSettings/GroupSettingsPage.jsx';
import RegisterPage from './pages/Register/RegisterPage.jsx';
import ProfilePage from './pages/Profile/ProfilePage.jsx';

import GroupCandidatesPage from './components/GroupCandidates/GroupCandidatesPage.jsx';
import NavBar from './components/NavBar/NavBar.jsx';
import HomeRoute from './pages/Home/HomePage.jsx';
import LoginPage from './pages/Login/LoginPage.jsx';
import CreateGroupPage from './pages/CreateGroup/CreateGroup.jsx';
import GroupDetailPage from './pages/GroupDetail/GroupDetailPage.jsx';
import SendEmailPage from './pages/Tools/SendEmailPage.jsx';
import ForgotPasswordPage from './pages/Login/ForgotPasswordPage.jsx';
import ResetPasswordPage from './pages/Login/ResetPasswordPage.jsx';

GroupDetailPage
export default function App() {
  const dispatch = useDispatch();
  const token = useSelector(s => s.auth.token);

  useEffect(() => {
    if (token) dispatch(fetchMe()); // ימלא userId/userEmail אחרי רענון
  }, [token, dispatch]);

  return (
    <div>
      <NavBar />
      <Routes>
        <Route path="/" element={<HomeRoute />} />
        <Route path="/profile" element={<ProfilePage />} />

        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />

        <Route path="/groups" element={<GroupsPage />} />
        <Route path="/groups/:groupId" element={<GroupDetailPage />} />
        <Route path="/groups/:groupId/candidates" element={<GroupCandidatesPage />} />
        <Route path="/groups/create" element={<CreateGroupPage />} />
        <Route path="/groups/:groupId/settings" element={<GroupSettingsPage />} />
        <Route path="/tools/send-email" element={<SendEmailPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
      </Routes>
    </div>
  );
}
