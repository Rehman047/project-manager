import { useNavigate } from 'react-router-dom';

import { useAuthStore } from '../store/authStore';

export default function DashboardPage() {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return <div className="flex min-h-screen items-center justify-center gap-4"><span>Welcome to Dashboard</span><button className="rounded bg-blue-600 px-4 py-2 text-white" onClick={handleLogout}>Log out</button></div>;
}
