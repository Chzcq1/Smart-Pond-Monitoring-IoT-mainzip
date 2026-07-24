import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { DataProvider } from '../../context/DataContext';

export default function Layout() {
  return (
    <DataProvider>
      <div className="flex h-[100dvh] overflow-hidden bg-[#020617] text-slate-50 font-sans">
        <Sidebar />
        <main className="flex-1 min-w-0 flex flex-col pl-[260px] overflow-hidden">
          <Outlet />
        </main>
      </div>
    </DataProvider>
  );
}
