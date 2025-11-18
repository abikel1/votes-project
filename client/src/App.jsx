import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast'; // ← הוסף
import { fetchMe } from './slices/authSlice';

import GroupsPage from './pages/GroupList/GroupsPage.jsx';
import GroupSettingsPage from './components/GroupSettings/GroupSettingsPage.jsx';
import RegisterPage from './pages/Register/RegisterPage.jsx';
import ProfilePage from './pages/Profile/ProfilePage.jsx';
import VotingPage from './components/Voting/VotingPage.jsx';
import NavBar from './components/NavBar/NavBar.jsx';
import HomeRoute from './pages/Home/HomePage.jsx';
import LoginPage from './pages/Login/LoginPage.jsx';
import CreateGroupPage from './pages/CreateGroup/CreateGroup.jsx';
import GroupDetailPage from './pages/GroupDetail/GroupDetailPage.jsx';
import SendEmailPage from './pages/Tools/SendEmailPage.jsx';
import ForgotPasswordPage from './pages/Login/ForgotPasswordPage.jsx';
import ResetPasswordPage from './pages/Login/ResetPasswordPage.jsx';
import JoinGroupPage from './pages/Join/JoinGroupPage.jsx';
import AboutPage from './pages/About/AboutPage.jsx';
import ToastDemo from './components/a.jsx';
import UserGuidePage from './pages/UserGuide/UserGuidePage.jsx';

export default function App() {
  const dispatch = useDispatch();
  const token = useSelector(s => s.auth.token);

  useEffect(() => {
    if (token) dispatch(fetchMe());
  }, [token, dispatch]);

return (
  <>
    <Toaster 
      position="top-center"
      reverseOrder={false}
      toastOptions={{
        duration: 3000,
        style: {
          background: '#fff',
          color: '#363636',
          fontSize: '16px',
          fontFamily: 'inherit',
        },
        success: {
          duration: 3000,
          iconTheme: { primary: '#10b981', secondary: '#fff' },
        },
        error: {
          duration: 4000,
          iconTheme: { primary: '#ef4444', secondary: '#fff' },
        },
      }}
    />

    <div>
      <NavBar />
      <Routes>
        <Route path="/" element={<HomeRoute />} />
        <Route path="/groups" element={<GroupsPage />} />
        <Route path="/groups/:groupSlug" element={<GroupDetailPage />} />
        <Route path="/groups/:groupSlug/candidates" element={<VotingPage />} />
        <Route path="/groups/create" element={<CreateGroupPage />} />
        <Route path="/groups/:groupSlug/settings" element={<GroupSettingsPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/user-guide" element={<UserGuidePage />} />
        <Route path="/tools/send-email" element={<SendEmailPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        <Route path="/join/:slug" element={<JoinGroupPage />} />
      </Routes>
    </div>
  </>
)
}
