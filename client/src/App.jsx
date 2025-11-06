import { Routes, Route } from 'react-router-dom';
// import { logout } from './slices/authSlice';
import GroupsPage from './pages/GroupList/GroupsPage.jsx';

import RegisterPage from './pages/Register/RegisterPage.jsx';
// import ProfilePage from './pages/ProfilePage.jsx';
// import UsersPage from './pages/UsersPage.jsx';
import GroupCandidatesPage from './components/GroupCandidates/GroupCandidatesPage.jsx';
import NavBar from './components/NavBar/NavBar.jsx';
import HomeRoute from './pages/Home/HomePage.jsx';
import LoginPage from './pages/Login/LoginPage.jsx';
import CreateGroupPage from './pages/CreateGroup/CreateGroup.jsx';

export default function App() {
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

        {/* <Route path="/users" element={<UsersPage />} /> */}
      </Routes>
    </div>
  );
}
