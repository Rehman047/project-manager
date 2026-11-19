import { Outlet } from 'react-router-dom';

import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-slate-100">
      <Sidebar />
      <Topbar />
      <main className="ml-64 min-h-screen pt-16">
        <div className="mx-auto max-w-[1500px] p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
