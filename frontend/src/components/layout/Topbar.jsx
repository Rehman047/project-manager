import { useProjectStore } from '../../store/projectStore';

export default function Topbar() {
  const activeProject = useProjectStore((state) => state.activeProject);

  return (
    <header className="fixed z-10 flex h-16 w-[calc(100%-16rem)] items-center border-b bg-white px-6">
      <h2 className="text-lg font-semibold text-gray-800">{activeProject?.name || 'Select a Project'}</h2>
    </header>
  );
}
