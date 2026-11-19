import { useProjectStore } from '../../store/projectStore';
import NotificationBell from '../notifications/NotificationBell';

export default function Topbar() {
  const activeProject = useProjectStore((state) => state.activeProject);

  return (
    <header className="fixed z-20 ml-64 flex h-16 w-[calc(100%-16rem)] items-center justify-between border-b border-slate-200 bg-white/95 px-8 backdrop-blur">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Workspace</p>
        <h2 className="text-sm font-semibold text-slate-800">{activeProject?.name || 'Select a project'}</h2>
      </div>
      <NotificationBell />
    </header>
  );
}
