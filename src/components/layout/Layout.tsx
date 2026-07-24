import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { DataProvider } from '../../context/DataContext';
import LanguageSwitcher from './LanguageSwitcher';

export default function Layout() {
  return (
    <DataProvider>
      <div className="flex h-[100dvh] overflow-hidden bg-[#020617] text-slate-50 font-sans">
        <Sidebar />
        <main className="flex-1 min-w-0 flex flex-col pl-[260px] overflow-hidden">
          <div className="h-14 shrink-0 border-b border-[#1e293b] bg-[#020617] flex items-center justify-end px-8">
            <LanguageSwitcher />
          </div>
          <Outlet />
        </main>
      </div>
    </DataProvider>
  );
}
