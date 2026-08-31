import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '@/hooks/useAppState';
import { KPICard } from '@/components/ui';
import { RequestFormModal } from '@/components/forms';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { monthlyQuotedWon } from '@/data/mock';
import {
  FolderKanban, FileText, Receipt, ShoppingCart, AlertTriangle,
  CheckCircle2, Send, Plus, ArrowRight,
} from 'lucide-react';
import { formatCurrency, formatDate, TODAY } from '@/lib/utils';

const recentActivity = [
  { icon: CheckCircle2, text: 'Quotation Q-2026-041 sent to customer', time: '2 hours ago', color: 'text-emerald-500' },
  { icon: Send, text: 'Purchase Order PO-2026-028 sent', time: '4 hours ago', color: 'text-blue-500' },
  { icon: CheckCircle2, text: 'Site inspection completed — Kitwe', time: '6 hours ago', color: 'text-emerald-500' },
  { icon: Receipt, text: 'Invoice payment received — ZMW 20,000', time: 'Yesterday', color: 'text-copper-500' },
  { icon: FileText, text: 'New customer enquiry — Kitwe Industrial Processing', time: 'Yesterday', color: 'text-blue-500' },
];

function daysBetween(a: string, b: string) {
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000);
}

export function Dashboard() {
  const navigate = useNavigate();
  const { quotations, projects, purchaseRequests, invoices } = useAppState();
  const [reqOpen, setReqOpen] = useState(false);

  const activeProjects = projects.filter(p => p.status !== 'Completed').length;
  const pendingQuotes = quotations.filter(q => ['Draft', 'Internal Review', 'Sent', 'Customer Reviewing'].includes(q.status));
  const quoteValue = pendingQuotes.reduce((s, q) => s + q.amount, 0);
  const receivables = invoices.reduce((s, i) => s + i.balance, 0);
  const openPOs = purchaseRequests.filter(pr => ['PO Issued', 'Partially Received'].includes(pr.status)).length;

  // Dynamic "requires attention"
  type Att = { customer: string; note: string; project: string; path: string; type: 'warning' | 'danger' };
  const attention: Att[] = [];
  invoices.filter(i => i.status === 'Overdue').forEach(i => attention.push({
    customer: i.customer, note: `Invoice ${formatCurrency(i.balance)} overdue`, project: i.project, path: '/invoices', type: 'danger',
  }));
  quotations.filter(q => ['Sent', 'Customer Reviewing', 'Draft'].includes(q.status) && daysBetween(TODAY, q.validUntil) >= 0 && daysBetween(TODAY, q.validUntil) <= 7).forEach(q => attention.push({
    customer: q.customer, note: `Quotation expires ${formatDate(q.validUntil)}`, project: q.project, path: `/quotations/${q.id}`, type: 'warning',
  }));
  projects.filter(p => p.materials.some(m => m.required > m.available && m.ordered <= 0)).forEach(p => attention.push({
    customer: p.customer, note: 'Material shortage — action needed', project: p.project, path: `/projects/${p.id}`, type: 'warning',
  }));
  const attentionShown = attention.slice(0, 5);

  const byCategory = Object.entries(projects.reduce<Record<string, number>>((acc, p) => { acc[p.category] = (acc[p.category] || 0) + 1; return acc; }, {}));
  const palette = ['#d97520', '#4d659a', '#535e78', '#687591', '#8793ab', '#e48e3e', '#3d507b'];
  const projectsByDepartment = byCategory.map(([name, value], i) => ({ name, value, color: palette[i % palette.length] }));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-semibold text-navy-900">Good morning, Tsindikai</h1>
        <p className="text-sm text-steel-500 mt-1">Here's what's happening across OMUSIBA today.</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4 mb-8">
        <KPICard label="Active Projects" value={activeProjects} icon={<FolderKanban size={18} />} />
        <KPICard label="Quotations Pending" value={pendingQuotes.length} icon={<FileText size={18} />} />
        <KPICard label="Pending Quote Value" value={formatCurrency(quoteValue)} icon={<Receipt size={18} />} />
        <KPICard label="Outstanding Receivables" value={formatCurrency(receivables)} icon={<Receipt size={18} />} />
        <KPICard label="Open Purchase Orders" value={openPOs} icon={<ShoppingCart size={18} />} />
        <KPICard label="Require Attention" value={attention.length} icon={<AlertTriangle size={18} />} />
      </div>

      {/* Quick Actions */}
      <div className="flex gap-3 mb-8 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 sm:overflow-visible sm:flex-wrap">
        {[
          { label: 'New Request', icon: Plus, action: () => setReqOpen(true) },
          { label: 'Create Quotation', icon: FileText, action: () => navigate('/quotations/new') },
          { label: 'New Project', icon: FolderKanban, action: () => navigate('/projects/new') },
          { label: 'Procurement', icon: ShoppingCart, action: () => navigate('/procurement') },
        ].map(a => (
          <button
            key={a.label}
            onClick={a.action}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-steel-200 rounded-lg text-sm font-medium text-navy-800 hover:bg-steel-50 hover:border-steel-300 transition-colors shadow-sm whitespace-nowrap flex-shrink-0"
          >
            <a.icon size={15} /> {a.label}
          </button>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-white rounded-lg border border-steel-200 p-4 sm:p-5 min-w-0">
          <h3 className="text-sm font-semibold text-navy-900 mb-4">Monthly Quoted vs Won Value</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={monthlyQuotedWon} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eceef2" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#687591' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#687591' }} axisLine={false} tickLine={false} width={38} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v) => formatCurrency(Number(v))} contentStyle={{ borderRadius: 8, border: '1px solid #d5d9e2', fontSize: 13 }} />
              <Bar dataKey="quoted" fill="#b1b9c9" radius={[3, 3, 0, 0]} name="Quoted" />
              <Bar dataKey="won" fill="#d97520" radius={[3, 3, 0, 0]} name="Won" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg border border-steel-200 p-4 sm:p-5 min-w-0">
          <h3 className="text-sm font-semibold text-navy-900 mb-4">Projects by Category</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={projectsByDepartment} dataKey="value" cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3}>
                {projectsByDepartment.map((d, i) => <Cell key={i} fill={d.color} />)}
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
        <div className="bg-white rounded-lg border border-steel-200 p-5">
          <h3 className="text-sm font-semibold text-navy-900 mb-4">Requires Attention</h3>
          <div className="space-y-3">
            {attentionShown.length === 0 && <p className="text-sm text-steel-400">Nothing needs attention right now.</p>}
            {attentionShown.map((item, i) => (
              <button
                key={i}
                onClick={() => navigate(item.path)}
                className="w-full flex items-start gap-3 p-3 rounded-lg border border-steel-100 hover:border-steel-300 hover:bg-steel-50 transition-colors text-left"
              >
                <div className={`mt-0.5 ${item.type === 'danger' ? 'text-red-500' : 'text-amber-500'}`}>
                  <AlertTriangle size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-navy-900 truncate">{item.customer}</p>
                  <p className="text-xs text-steel-500 mt-0.5">{item.note}</p>
                  <p className="text-xs text-steel-400 mt-0.5 truncate">{item.project}</p>
                </div>
                <ArrowRight size={14} className="text-steel-400 mt-1 flex-shrink-0" />
              </button>
            ))}
          </div>
        </div>

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

      <RequestFormModal open={reqOpen} onClose={() => setReqOpen(false)} />
    </div>
  );
}
