import { Routes, Route, Link } from 'react-router-dom'
import RegisterPage from './pages/RegisterPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import ProfilePage from './pages/ProfilePage.jsx'
import UsersPage from './pages/UsersPage.jsx'

function App() {
  return (
    <div>
      <nav>
        <Link to="/register">הרשמה</Link> |
        <Link to="/login">התחברות</Link> |
        <Link to="/profile">פרופיל</Link> |
        <Link to="/users">משתמשים</Link>
      </nav>

      <Routes>
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/users" element={<UsersPage />} />
      </Routes>
    </div>
  )
}

export default App
