import NavBar from './components/NavBar/NavBar.jsx';
import HomeRoute from './pages/Home/HomePage.jsx';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

export default function App() {
  return (
    <div>
      <NavBar />

      <Routes>
        {/* <Route path="/register" element={<RegisterPage />} /> */}
        {/* <Route path="/login" element={<LoginPage />} /> */}
        <Route path="/" element={<HomeRoute />} />
        {/* <Route path="/me" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} /> */}
        {/* <Route path="/users" element={<UsersPage />} /> */}
      </Routes>
    </div>
  );
}
