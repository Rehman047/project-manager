import { NavLink, useNavigate } from 'react-router-dom';

import { useAuthStore } from '../../store/authStore';
import { useProjectStore } from '../../store/projectStore';

const linkClasses = ({ isActive }) =>
  `block rounded px-4 py-3 ${isActive ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-800'}`;

export default function Sidebar() {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const activeProject = useProjectStore((state) => state.activeProject);
  const clearActiveProject = useProjectStore((state) => state.clearActiveProject);

  const handleLogout = () => {
    logout();
    clearActiveProject();
    navigate('/login');
  };

  return (
    <aside className="fixed flex min-h-screen w-64 flex-col bg-gray-900 p-4 text-white">
      <h1 className="mb-8 px-4 text-xl font-bold">Project Manager</h1>
      <nav className="space-y-2">
        <NavLink className={linkClasses} to="/">Dashboard</NavLink>
        <NavLink className={linkClasses} end to="/backlog" onClick={(event) => !activeProject && event.preventDefault()}>
          <span className={!activeProject ? 'text-gray-600' : ''}>Backlog</span>
        </NavLink>
        <NavLink className={linkClasses} to="/board" onClick={(event) => !activeProject && event.preventDefault()}>
          <span className={!activeProject ? 'text-gray-600' : ''}>Board</span>
        </NavLink>
        <NavLink className={linkClasses} to="/sprint" onClick={(event) => !activeProject && event.preventDefault()}>
          <span className={!activeProject ? 'text-gray-600' : ''}>Sprint</span>
        </NavLink>
      </nav>
      <button className="mt-auto rounded px-4 py-3 text-left text-gray-300 hover:bg-gray-800" onClick={handleLogout}>
        Logout
      </button>
    </aside>
  );
}
