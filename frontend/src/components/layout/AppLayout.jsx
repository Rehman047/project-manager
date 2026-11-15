import { Outlet } from 'react-router-dom';

import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function AppLayout() {
  return (
    <>
      <Sidebar />
      <Topbar />
      <main className="ml-64 min-h-screen bg-gray-50 p-6 pt-16">
        <Outlet />
      </main>
    </>
  );
}
