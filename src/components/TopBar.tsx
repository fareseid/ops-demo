import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, ChevronDown } from 'lucide-react';
import { Avatar } from './ui';
import { notifications } from '@/data/mock';
import { cn } from '@/lib/utils';

// Global search data
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

export function TopBar() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifOpen, setNotifOpen] = useState(false);
  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const results = searchQuery.length > 1
    ? searchIndex.filter(s => s.label.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 6)
    : [];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setSearchOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <header className="h-14 bg-white border-b border-steel-200 flex items-center px-6 gap-4 sticky top-0 z-30">
      {/* Search */}
      <div ref={searchRef} className="relative flex-1 max-w-md">
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
                onClick={() => { navigate(r.path); setSearchOpen(false); setSearchQuery(''); }}
              >
                <span className="text-navy-900 font-medium">{r.label}</span>
                <span className="text-xs text-steel-400">{r.type}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 ml-auto">
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
            <div className="absolute right-0 top-full mt-1 w-80 bg-white border border-steel-200 rounded-lg shadow-lg z-50">
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

        {/* Company & User */}
        <div className="hidden lg:flex items-center gap-2 pl-3 border-l border-steel-200">
          <span className="text-xs text-steel-400">OMUSIBA Engineering & Suppliers Ltd</span>
        </div>
        <div className="flex items-center gap-2">
          <Avatar name="Tsindikai Mudemba" size="sm" />
          <div className="hidden md:block">
            <p className="text-xs font-medium text-navy-900 leading-tight">Tsindikai Mudemba</p>
            <p className="text-[10px] text-steel-400 leading-tight">Managing Director</p>
          </div>
        </div>
      </div>
    </header>
  );
}
