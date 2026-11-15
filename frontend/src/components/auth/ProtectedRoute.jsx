import { Navigate, Outlet } from 'react-router-dom';

import { useAuthStore } from '../../store/authStore';

export default function ProtectedRoute({ children }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate replace to="/login" />;
  }

  return children || <Outlet />;
}
