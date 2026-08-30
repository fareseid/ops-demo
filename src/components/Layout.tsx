import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { ToastContainer } from './ui';
import { useAppState } from '@/hooks/useAppState';

export function Layout() {
  const { toasts, removeToast } = useAppState();

  return (
    <div className="min-h-screen bg-[#f8f9fb]">
      <Sidebar />
      <div className="pl-60">
        <TopBar />
        <main className="p-6 max-w-[1400px]">
          <Outlet />
        </main>
      </div>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
