import { useNavigate } from 'react-router-dom';
import { KPICard, Avatar, StatusBadge } from '@/components/ui';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { monthlyQuotedWon, projectsByDepartment } from '@/data/mock';
import {
  FolderKanban, FileText, Receipt, ShoppingCart, AlertTriangle,
  Clock, CheckCircle2, Send, Plus, ArrowRight,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

const attentionItems = [
  { customer: 'Copperbelt Mining Services', note: 'Materials required before 3 Sep', project: 'Electrical Panel Upgrade', path: '/projects/PRJ-2026-018', type: 'warning' },
  { customer: 'Lusaka Commercial Centre', note: 'Quotation expires in 2 days', project: 'HVAC Installation', path: '/quotations/Q-2026-040', type: 'warning' },
  { customer: 'Kafue Manufacturing Ltd', note: 'Invoice ZMW 84,500 overdue by 12 days', project: 'Hydraulic System Overhaul', path: '/invoices', type: 'danger' },
];

const recentActivity = [
  { icon: CheckCircle2, text: 'Quotation Q-2026-041 approved', time: '2 hours ago', color: 'text-emerald-500' },
  { icon: Send, text: 'Purchase Order PO-2026-028 sent', time: '4 hours ago', color: 'text-blue-500' },
  { icon: CheckCircle2, text: 'Site inspection completed — Kitwe', time: '6 hours ago', color: 'text-emerald-500' },
  { icon: Receipt, text: 'Invoice payment received — ZMW 20,000', time: 'Yesterday', color: 'text-copper-500' },
  { icon: FileText, text: 'New customer enquiry — Kitwe Industrial Processing', time: 'Yesterday', color: 'text-blue-500' },
];

export function Dashboard() {
  const navigate = useNavigate();

  return (
    <div>
      {/* Greeting */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-navy-900">Good morning, Tsindikai</h1>
        <p className="text-sm text-steel-500 mt-1">Here's what's happening across OMUSIBA today.</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        <KPICard label="Active Projects" value="8" icon={<FolderKanban size={18} />} />
        <KPICard label="Quotations Pending" value="6" icon={<FileText size={18} />} />
        <KPICard label="Quotation Value" value={formatCurrency(1284500)} icon={<Receipt size={18} />} />
        <KPICard label="Outstanding Receivables" value={formatCurrency(438250)} icon={<Receipt size={18} />} />
        <KPICard label="Open Purchase Orders" value="7" icon={<ShoppingCart size={18} />} />
        <KPICard label="Require Attention" value="3" icon={<AlertTriangle size={18} />} />
      </div>

      {/* Quick Actions */}
      <div className="flex gap-3 mb-8">
        {[
          { label: 'New Request', icon: Plus, path: '/requests' },
          { label: 'Create Quotation', icon: FileText, path: '/quotations' },
          { label: 'New Project', icon: FolderKanban, path: '/projects' },
          { label: 'Purchase Order', icon: ShoppingCart, path: '/procurement' },
        ].map(a => (
          <button
            key={a.label}
            onClick={() => navigate(a.path)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-steel-200 rounded-lg text-sm font-medium text-navy-800 hover:bg-steel-50 hover:border-steel-300 transition-colors shadow-sm"
          >
            <a.icon size={15} /> {a.label}
          </button>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Monthly Quoted vs Won */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-steel-200 p-5">
          <h3 className="text-sm font-semibold text-navy-900 mb-4">Monthly Quoted vs Won Value</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={monthlyQuotedWon} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eceef2" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#687591' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#687591' }} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v) => formatCurrency(Number(v))} contentStyle={{ borderRadius: 8, border: '1px solid #d5d9e2', fontSize: 13 }} />
              <Bar dataKey="quoted" fill="#b1b9c9" radius={[3, 3, 0, 0]} name="Quoted" />
              <Bar dataKey="won" fill="#d97520" radius={[3, 3, 0, 0]} name="Won" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Projects by Department */}
        <div className="bg-white rounded-lg border border-steel-200 p-5">
          <h3 className="text-sm font-semibold text-navy-900 mb-4">Projects by Department</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={projectsByDepartment} dataKey="value" cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3}>
                {projectsByDepartment.map((d, i) => (
                  <Cell key={i} fill={d.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #d5d9e2', fontSize: 13 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
            {projectsByDepartment.map(d => (
              <div key={d.name} className="flex items-center gap-1.5 text-xs text-steel-600">
                <div className="w-2.5 h-2.5 rounded-sm" style={{ background: d.color }} />
                {d.name} ({d.value})
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Requires Attention */}
        <div className="bg-white rounded-lg border border-steel-200 p-5">
          <h3 className="text-sm font-semibold text-navy-900 mb-4">Requires Attention</h3>
          <div className="space-y-3">
            {attentionItems.map((item, i) => (
              <button
                key={i}
                onClick={() => navigate(item.path)}
                className="w-full flex items-start gap-3 p-3 rounded-lg border border-steel-100 hover:border-steel-300 hover:bg-steel-50 transition-colors text-left"
              >
                <div className={`mt-0.5 ${item.type === 'danger' ? 'text-red-500' : 'text-amber-500'}`}>
                  <AlertTriangle size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-navy-900">{item.customer}</p>
                  <p className="text-xs text-steel-500 mt-0.5">{item.note}</p>
                  <p className="text-xs text-steel-400 mt-0.5">{item.project}</p>
                </div>
                <ArrowRight size={14} className="text-steel-400 mt-1 flex-shrink-0" />
              </button>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg border border-steel-200 p-5">
          <h3 className="text-sm font-semibold text-navy-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {recentActivity.map((a, i) => (
              <div key={i} className="flex items-start gap-3">
                <a.icon size={16} className={`mt-0.5 flex-shrink-0 ${a.color}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-navy-800">{a.text}</p>
                  <p className="text-xs text-steel-400 mt-0.5">{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
