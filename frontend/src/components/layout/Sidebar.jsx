import { NavLink, useNavigate } from 'react-router-dom';

import { useAuthStore } from '../../store/authStore';
import { useProjectStore } from '../../store/projectStore';

const linkClasses = ({ isActive }) =>
  `flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition ${
    isActive ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
  }`;

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
    <aside className="fixed z-30 flex min-h-screen w-64 flex-col border-r border-slate-800 bg-slate-950 px-4 py-5 text-white">
      <div className="mb-7 flex items-center gap-3 px-2">
        <div className="grid h-9 w-9 place-items-center rounded-lg bg-blue-600 text-sm font-bold">PM</div>
        <div><h1 className="text-sm font-semibold">Project Manager</h1><p className="text-xs text-slate-500">Workspace</p></div>
      </div>
      {activeProject && <div className="mb-5 rounded-lg border border-slate-800 bg-slate-900 p-3">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Current project</p>
        <p className="mt-1 truncate text-sm font-semibold">{activeProject.name}</p>
      </div>}
      <nav className="space-y-1">
        <NavLink className={linkClasses} end to="/">Dashboard</NavLink>
        <NavLink className={linkClasses} end to="/backlog" onClick={(event) => !activeProject && event.preventDefault()}>
          <span className={!activeProject ? 'text-slate-600' : ''}>Backlog</span>
        </NavLink>
        <NavLink className={linkClasses} to="/board" onClick={(event) => !activeProject && event.preventDefault()}>
          <span className={!activeProject ? 'text-slate-600' : ''}>Board</span>
        </NavLink>
        <NavLink className={linkClasses} to="/sprint" onClick={(event) => !activeProject && event.preventDefault()}>
          <span className={!activeProject ? 'text-slate-600' : ''}>Sprints &amp; Analytics</span>
        </NavLink>
        <NavLink className={linkClasses} to="/ai" onClick={(event) => !activeProject && event.preventDefault()}>
          <span className={!activeProject ? 'text-slate-600' : ''}>AI Assistant</span>
        </NavLink>
        <NavLink className={linkClasses} to="/notifications">Notifications</NavLink>
        <NavLink className={linkClasses} to="/members" onClick={(event) => !activeProject && event.preventDefault()}>
          <span className={!activeProject ? 'text-slate-600' : ''}>Team Members</span>
        </NavLink>
      </nav>
      <button className="mt-auto rounded px-4 py-3 text-left text-gray-300 hover:bg-gray-800" onClick={handleLogout}>
        Logout
      </button>
    </aside>
  );
}
