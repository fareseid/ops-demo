import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, FileText, Receipt, FolderKanban, Package, ShoppingCart,
  Truck, FileStack, ChevronLeft, ChevronRight, Wrench,
} from 'lucide-react';
import { useState } from 'react';

const navSections = [
  {
    items: [
      { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
    ],
  },
  {
    title: 'Sales & Operations',
    items: [
      { label: 'Requests', icon: FileText, path: '/requests' },
      { label: 'Quotations', icon: Receipt, path: '/quotations' },
    ],
  },
  {
    title: 'Execution',
    items: [
      { label: 'Projects & Jobs', icon: FolderKanban, path: '/projects' },
      { label: 'Materials', icon: Package, path: '/materials' },
      { label: 'Procurement', icon: ShoppingCart, path: '/procurement' },
    ],
  },
  {
    title: 'Resources',
    items: [
      { label: 'Equipment & Labour', icon: Truck, path: '/resources' },
    ],
  },
  {
    title: 'Finance',
    items: [
      { label: 'Invoices & Receivables', icon: Receipt, path: '/invoices' },
    ],
  },
  {
    items: [
      { label: 'Documents', icon: FileStack, path: '/documents' },
    ],
  },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <aside className={cn(
      'fixed left-0 top-0 h-screen bg-navy-900 text-white flex flex-col z-40 transition-all duration-200',
      collapsed ? 'w-16' : 'w-60'
    )}>
      {/* Logo */}
      <div className={cn('flex items-center gap-2.5 px-4 h-14 border-b border-navy-700/50', collapsed && 'justify-center')}>
        <div className="w-8 h-8 rounded-lg bg-copper-500 flex items-center justify-center flex-shrink-0">
          <Wrench size={16} className="text-white" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">OMUSIBA</p>
            <p className="text-[10px] text-navy-300 truncate">Operations</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        {navSections.map((section, si) => (
          <div key={si} className={si > 0 ? 'mt-4' : ''}>
            {section.title && !collapsed && (
              <p className="px-3 mb-1 text-[10px] font-semibold text-navy-400 uppercase tracking-wider">{section.title}</p>
            )}
            {section.items.map(item => {
              const isActive = item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path);
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors mb-0.5',
                    isActive ? 'bg-navy-700/60 text-white' : 'text-navy-300 hover:bg-navy-800 hover:text-white',
                    collapsed && 'justify-center px-2'
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <item.icon size={18} className="flex-shrink-0" />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Collapse */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-center py-3 border-t border-navy-700/50 text-navy-400 hover:text-white transition-colors"
      >
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>
    </aside>
  );
}
