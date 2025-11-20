import { useSelector } from 'react-redux';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

export default function RequireAuth() {
  const { token, userId, userEmail } = useSelector((s) => s.auth);
  const location = useLocation();

  const isAuthed =
    !!token ||
    !!userId ||
    !!userEmail ||
    !!localStorage.getItem('authToken') ||
    !!localStorage.getItem('token');

  if (!isAuthed) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
