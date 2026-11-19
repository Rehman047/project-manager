import { Route, Routes } from 'react-router-dom';

import ProtectedRoute from './components/auth/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';
import BacklogPage from './pages/BacklogPage';
import DashboardPage from './pages/DashboardPage';
import BoardPage from './pages/BoardPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import SprintPage from './pages/SprintPage';
import AIPage from './pages/AIPage';
import NotificationsPage from './pages/NotificationsPage';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/backlog" element={<BacklogPage />} />
          <Route path="/board" element={<BoardPage />} />
          <Route path="/sprint" element={<SprintPage />} />
          <Route path="/ai" element={<AIPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
        </Route>
      </Route>
    </Routes>
  );
}
