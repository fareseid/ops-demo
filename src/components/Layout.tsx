import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { ToastContainer } from './ui';
import { useAppState } from '@/hooks/useAppState';

export function Layout() {
  const { toasts, removeToast } = useAppState();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f8f9fb]">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:pl-60">
        <TopBar onMenuClick={() => setSidebarOpen(true)} />
        <main className="p-4 sm:p-6 max-w-[1400px]">
          <Outlet />
        </main>
      </div>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
