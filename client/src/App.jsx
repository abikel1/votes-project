import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Routes, Route } from 'react-router-dom';
import { fetchMe } from './slices/authSlice';

import GroupsPage from './pages/GroupList/GroupsPage.jsx';
import GroupSettingsPage from './components/GroupSettings/GroupSettingsPage.jsx';
import RegisterPage from './pages/Register/RegisterPage.jsx';
import GroupCandidatesPage from './components/GroupCandidates/GroupCandidatesPage.jsx';
import NavBar from './components/NavBar/NavBar.jsx';
import HomeRoute from './pages/Home/HomePage.jsx';
import LoginPage from './pages/Login/LoginPage.jsx';
import CreateGroupPage from './pages/CreateGroup/CreateGroup.jsx';

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
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/groups/:groupId/candidates" element={<GroupCandidatesPage />} />
        <Route path="/groups" element={<GroupsPage />} />
        <Route path="/" element={<HomeRoute />} />
        <Route path="/groups/create" element={<CreateGroupPage />} />
        <Route path="/groups/:groupId/settings" element={<GroupSettingsPage />} />
      </Routes>
    </div>
  );
}
