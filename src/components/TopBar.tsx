import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, Menu, X, ChevronDown, RotateCcw, LogOut } from 'lucide-react';
import { Avatar, ConfirmDialog } from './ui';
import { notifications } from '@/data/mock';
import { useAppState } from '@/hooks/useAppState';

const searchIndex = [
  { label: 'Copperbelt Mining Services', type: 'Customer', path: '/requests' },
  { label: 'Kafue Manufacturing Ltd', type: 'Customer', path: '/requests' },
  { label: 'Lusaka Commercial Centre', type: 'Customer', path: '/requests' },
  { label: 'Zambezi Logistics', type: 'Customer', path: '/requests' },
  { label: 'Northgate Foods Zambia', type: 'Customer', path: '/requests' },
  { label: 'Electrical Panel Upgrade', type: 'Project', path: '/projects/PRJ-2026-018' },
  { label: 'HVAC Installation', type: 'Project', path: '/projects/PRJ-2026-017' },
  { label: 'Hydraulic System Overhaul', type: 'Project', path: '/projects/PRJ-2026-016' },
  { label: 'Q-2026-041', type: 'Quotation', path: '/quotations/Q-2026-041' },
  { label: 'Q-2026-040', type: 'Quotation', path: '/quotations/Q-2026-040' },
  { label: 'Q-2026-039', type: 'Quotation', path: '/quotations/Q-2026-039' },
  { label: 'PRJ-2026-018', type: 'Project', path: '/projects/PRJ-2026-018' },
  { label: 'PRJ-2026-017', type: 'Project', path: '/projects/PRJ-2026-017' },
  { label: 'PR-2026-024', type: 'Purchase Request', path: '/procurement' },
  { label: 'INV-2026-086', type: 'Invoice', path: '/invoices' },
  { label: 'MCCB 250A', type: 'Material', path: '/materials' },
  { label: 'Cold Room Compressor Repair', type: 'Project', path: '/projects/PRJ-2026-015' },
  { label: 'Transport & Labour Hire', type: 'Project', path: '/projects/PRJ-2026-014' },
];

export function TopBar({ onMenuClick }: { onMenuClick: () => void }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifOpen, setNotifOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const { resetDemo, addToast } = useAppState();
  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  const results = searchQuery.length > 1
    ? searchIndex.filter(s => s.label.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 6)
    : [];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setSearchOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
      if (userRef.current && !userRef.current.contains(e.target as Node)) setUserOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = (path: string) => {
    navigate(path);
    setSearchOpen(false);
    setMobileSearchOpen(false);
    setSearchQuery('');
  };

  return (
    <header className="h-14 bg-white border-b border-steel-200 flex items-center px-3 sm:px-6 gap-2 sm:gap-4 sticky top-0 z-30">
      {/* Hamburger */}
      <button onClick={onMenuClick} className="lg:hidden p-2 -ml-1 rounded-lg hover:bg-steel-50 text-steel-500">
        <Menu size={20} />
      </button>

      {/* Desktop search */}
      <div ref={searchRef} className="relative flex-1 max-w-md hidden sm:block">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-steel-400" />
        <input
          type="text"
          placeholder="Search projects, customers, quotations..."
          className="w-full pl-9 pr-3 py-2 text-sm bg-steel-50 border border-steel-200 rounded-lg placeholder-steel-400 focus:outline-none focus:ring-2 focus:ring-navy-200 focus:bg-white"
          value={searchQuery}
          onFocus={() => setSearchOpen(true)}
          onChange={e => { setSearchQuery(e.target.value); setSearchOpen(true); }}
        />
        {searchOpen && results.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-steel-200 rounded-lg shadow-lg overflow-hidden z-50">
            {results.map((r, i) => (
              <button
                key={i}
                className="w-full flex items-center justify-between px-4 py-2.5 text-sm hover:bg-steel-50 text-left"
                onClick={() => handleSelect(r.path)}
              >
                <span className="text-navy-900 font-medium">{r.label}</span>
                <span className="text-xs text-steel-400">{r.type}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Mobile: spacer */}
      <div className="flex-1 sm:hidden" />

      <div className="flex items-center gap-1 sm:gap-3 ml-auto">
        {/* Mobile search toggle */}
        <button onClick={() => setMobileSearchOpen(!mobileSearchOpen)} className="sm:hidden p-2 rounded-lg hover:bg-steel-50 text-steel-500">
          {mobileSearchOpen ? <X size={18} /> : <Search size={18} />}
        </button>

        {/* Notifications */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative p-2 rounded-lg hover:bg-steel-50 text-steel-500"
          >
            <Bell size={18} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>
          {notifOpen && (
            <div className="absolute right-0 top-full mt-1 w-72 sm:w-80 bg-white border border-steel-200 rounded-lg shadow-lg z-50">
              <div className="px-4 py-3 border-b border-steel-100">
                <p className="text-sm font-semibold text-navy-900">Notifications</p>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.map(n => (
                  <div key={n.id} className="px-4 py-3 border-b border-steel-50 hover:bg-steel-50 cursor-pointer">
                    <p className="text-sm text-navy-800">{n.message}</p>
                    <p className="text-xs text-steel-400 mt-1">{n.time}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User */}
        <div ref={userRef} className="relative pl-2 sm:pl-3 border-l border-steel-200">
          <button onClick={() => setUserOpen(o => !o)} className="flex items-center gap-2 rounded-lg hover:bg-steel-50 py-1 px-1">
            <Avatar name="Tsindikai Mudemba" size="sm" />
            <div className="hidden md:block text-left">
              <p className="text-xs font-medium text-navy-900 leading-tight">Tsindikai Mudemba</p>
              <p className="text-[10px] text-steel-400 leading-tight">Managing Director</p>
            </div>
            <ChevronDown size={14} className="text-steel-400 hidden md:block" />
          </button>
          {userOpen && (
            <div className="absolute right-0 top-full mt-1 w-60 bg-white border border-steel-200 rounded-lg shadow-lg z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-steel-100">
                <p className="text-sm font-semibold text-navy-900">Tsindikai Mudemba</p>
                <p className="text-xs text-steel-400">Managing Director</p>
              </div>
              <div className="px-2 py-1.5 border-b border-steel-100">
                <p className="px-2 py-1 text-[10px] font-semibold text-steel-400 uppercase tracking-wider">Demo Settings</p>
                <button
                  onClick={() => { setUserOpen(false); setConfirmReset(true); }}
                  className="w-full flex items-center gap-2.5 px-2 py-2 rounded-md text-sm text-navy-800 hover:bg-steel-50 text-left"
                >
                  <RotateCcw size={15} className="text-steel-400" /> Reset Demo Data
                </button>
              </div>
              <button onClick={() => { setUserOpen(false); addToast('This is a demo — sign out is disabled.', 'info'); }} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-steel-500 hover:bg-steel-50 text-left">
                <LogOut size={15} className="text-steel-400" /> Sign out
              </button>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={confirmReset}
        title="Reset demo data?"
        message="This restores the original demo dataset and discards any records you created in this browser."
        confirmLabel="Reset"
        danger={false}
        onConfirm={() => { resetDemo(); setConfirmReset(false); addToast('Demo data has been reset.'); navigate('/'); }}
        onCancel={() => setConfirmReset(false)}
      />

      {/* Mobile search bar - slides down */}
      {mobileSearchOpen && (
        <div className="absolute left-0 right-0 top-14 bg-white border-b border-steel-200 p-3 sm:hidden z-40">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-steel-400" />
            <input
              type="text"
              placeholder="Search..."
              autoFocus
              className="w-full pl-9 pr-3 py-2.5 text-sm bg-steel-50 border border-steel-200 rounded-lg placeholder-steel-400 focus:outline-none focus:ring-2 focus:ring-navy-200 focus:bg-white"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          {results.length > 0 && (
            <div className="mt-2 bg-white border border-steel-200 rounded-lg overflow-hidden">
              {results.map((r, i) => (
                <button
                  key={i}
                  className="w-full flex items-center justify-between px-4 py-2.5 text-sm hover:bg-steel-50 text-left"
                  onClick={() => handleSelect(r.path)}
                >
                  <span className="text-navy-900 font-medium">{r.label}</span>
                  <span className="text-xs text-steel-400">{r.type}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </header>
  );
}
