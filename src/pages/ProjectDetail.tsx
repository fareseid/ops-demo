import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAppState } from '@/hooks/useAppState';
import { StatusBadge, Button, ProgressBar, Tabs, Avatar, KPICard } from '@/components/ui';
import { formatCurrency, formatDate } from '@/lib/utils';
import { MapPin, Calendar, User, CheckCircle2, Circle, Clock, Receipt, FileText, ShoppingCart, ArrowRight, AlertTriangle } from 'lucide-react';

const docsList = [
  { name: 'Site Inspection Report.pdf', size: '456 KB' },
  { name: 'Customer PO.pdf', size: '89 KB' },
  { name: 'Electrical Drawing.pdf', size: '1.2 MB' },
  { name: 'Safety Checklist.pdf', size: '67 KB' },
];

const activityLog = [
  { text: 'Purchase Order PO-2026-028 sent to supplier', time: '4 hours ago' },
  { text: 'Materials shortage flagged — MCCB 250A breakers', time: '6 hours ago' },
  { text: 'Site inspection completed', time: 'Yesterday' },
  { text: 'Final measurements recorded', time: '2 days ago' },
  { text: 'Project created from Q-2026-041', time: '3 days ago' },
];

export function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { projects, toggleProjectTask, addToast } = useAppState();
  const p = projects.find(p => p.id === id);
  const [tab, setTab] = useState('Overview');

  if (!p) return <div className="p-8 text-steel-500">Project not found.</div>;

  const margin = p.costs.quotedRevenue - p.costs.materialCost - p.costs.labourCost - p.costs.transport - p.costs.otherCosts;
  const marginPct = ((margin / p.costs.quotedRevenue) * 100).toFixed(1);

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-steel-500 mb-4">
        <Link to="/projects" className="hover:text-navy-700">Projects & Jobs</Link>
        <span>/</span>
        <span className="text-navy-900 font-medium">{p.id}</span>
      </div>

      {/* Header */}
      <div className="bg-white rounded-lg border border-steel-200 p-6 mb-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-semibold text-navy-900">{p.project}</h1>
              <StatusBadge status={p.status} />
            </div>
            <p className="text-sm text-steel-600 mt-1">{p.customer}</p>
            <div className="flex flex-wrap gap-4 mt-3 text-sm text-steel-500">
              <span className="flex items-center gap-1"><MapPin size={14} /> {p.location}</span>
              <span className="flex items-center gap-1"><Calendar size={14} /> {formatDate(p.startDate)} — {formatDate(p.targetCompletion)}</span>
              <span className="flex items-center gap-1"><User size={14} /> {p.projectManager}</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-navy-900">{formatCurrency(p.value)}</p>
            <div className="flex items-center gap-2 mt-2 justify-end">
              <ProgressBar value={p.progress} className="w-32" />
              <span className="text-sm font-medium text-steel-600">{p.progress}%</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2 mt-4 pt-4 border-t border-steel-100">
          {p.quotationId && (
            <Button variant="secondary" size="sm" onClick={() => navigate(`/quotations/${p.quotationId}`)}>
              <Receipt size={14} /> View Quotation
            </Button>
          )}
          <Button variant="secondary" size="sm" onClick={() => navigate('/procurement')}>
            <ShoppingCart size={14} /> Procurement
          </Button>
          <Button variant="secondary" size="sm" onClick={() => navigate('/invoices')}>
            <FileText size={14} /> Invoices
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs tabs={['Overview', 'Tasks', 'Materials', 'Team', 'Costs', 'Documents', 'Activity']} active={tab} onChange={setTab} />

      <div className="mt-6">
        {tab === 'Overview' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-steel-200 p-5">
              <h3 className="text-sm font-semibold text-navy-900 mb-2">Scope of Work</h3>
              <p className="text-sm text-steel-700 leading-relaxed">{p.scope}</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg border border-steel-200 p-4">
                <p className="text-xs text-steel-400 uppercase font-semibold">Customer Contact</p>
                <p className="text-sm text-navy-800 mt-1">{p.customerContact}</p>
              </div>
              <div className="bg-white rounded-lg border border-steel-200 p-4">
                <p className="text-xs text-steel-400 uppercase font-semibold">Project Manager</p>
                <p className="text-sm text-navy-800 mt-1">{p.projectManager}</p>
              </div>
              <div className="bg-white rounded-lg border border-steel-200 p-4">
                <p className="text-xs text-steel-400 uppercase font-semibold">Category</p>
                <p className="text-sm text-navy-800 mt-1">{p.category}</p>
              </div>
              <div className="bg-white rounded-lg border border-steel-200 p-4">
                <p className="text-xs text-steel-400 uppercase font-semibold">Target Completion</p>
                <p className="text-sm text-navy-800 mt-1">{formatDate(p.targetCompletion)}</p>
              </div>
            </div>
          </div>
        )}

        {tab === 'Tasks' && (
          <div className="bg-white rounded-lg border border-steel-200">
            {p.tasks.map((t, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-3.5 border-b border-steel-50 last:border-0 hover:bg-steel-50/50">
                <button onClick={() => { toggleProjectTask(p.id, i); addToast(`Task "${t.name}" updated.`); }}>
                  {t.status === 'Complete' ? (
                    <CheckCircle2 size={18} className="text-emerald-500" />
                  ) : t.status === 'In Progress' ? (
                    <Clock size={18} className="text-copper-500" />
                  ) : (
                    <Circle size={18} className="text-steel-300" />
                  )}
                </button>
                <span className={`text-sm flex-1 ${t.status === 'Complete' ? 'text-steel-400 line-through' : 'text-navy-800'}`}>{t.name}</span>
                <StatusBadge status={t.status} />
              </div>
            ))}
          </div>
        )}

        {tab === 'Materials' && (
          <div className="bg-white rounded-lg border border-steel-200 overflow-hidden">
            {p.materials.length === 0 ? (
              <div className="p-8 text-center text-steel-400 text-sm">No material requirements for this project.</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-steel-100 bg-steel-50/50">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-steel-500 uppercase">Item</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-steel-500 uppercase">Required</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-steel-500 uppercase">Available</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-steel-500 uppercase">Ordered</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-steel-500 uppercase">Unit</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-steel-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {p.materials.map((m, i) => (
                    <tr key={i} className="border-b border-steel-50">
                      <td className="px-5 py-3 text-navy-800 font-medium">{m.item}</td>
                      <td className="px-4 py-3 text-right text-steel-600">{m.required}</td>
                      <td className={`px-4 py-3 text-right font-medium ${m.available < m.required ? 'text-red-600' : 'text-emerald-600'}`}>{m.available}</td>
                      <td className="px-4 py-3 text-right text-steel-500">{m.ordered}</td>
                      <td className="px-4 py-3 text-steel-500">{m.unit}</td>
                      <td className="px-4 py-3"><StatusBadge status={m.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {p.materials.some(m => m.status === 'Shortage') && (
              <div className="px-5 py-3 bg-amber-50 border-t border-amber-200 flex items-center gap-2">
                <AlertTriangle size={14} className="text-amber-600" />
                <span className="text-sm text-amber-700">Some materials have shortages.</span>
                <button onClick={() => navigate('/procurement')} className="text-sm text-navy-700 font-medium hover:underline ml-auto flex items-center gap-1">
                  View Procurement <ArrowRight size={13} />
                </button>
              </div>
            )}
          </div>
        )}

        {tab === 'Team' && (
          <div className="bg-white rounded-lg border border-steel-200">
            {p.team.map((tm, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-3.5 border-b border-steel-50 last:border-0">
                <Avatar name={tm.name} size="md" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-navy-900">{tm.name}{tm.count && tm.count > 1 ? ` × ${tm.count}` : ''}</p>
                  <p className="text-xs text-steel-500">{tm.role}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'Costs' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <KPICard label="Quoted Revenue" value={formatCurrency(p.costs.quotedRevenue)} />
              <KPICard label="Material Cost" value={formatCurrency(p.costs.materialCost)} />
              <KPICard label="Labour Cost" value={formatCurrency(p.costs.labourCost)} />
              <KPICard label="Transport" value={formatCurrency(p.costs.transport)} />
              <KPICard label="Other Costs" value={formatCurrency(p.costs.otherCosts)} />
              <div className={`bg-white rounded-lg border p-5 ${Number(marginPct) > 0 ? 'border-emerald-200' : 'border-red-200'}`}>
                <p className="text-sm text-steel-500 font-medium">Estimated Margin</p>
                <p className={`text-2xl font-semibold mt-1 ${Number(marginPct) > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {formatCurrency(margin)}
                </p>
                <p className="text-xs text-steel-400 mt-1">{marginPct}% margin</p>
              </div>
            </div>
          </div>
        )}

        {tab === 'Documents' && (
          <div className="bg-white rounded-lg border border-steel-200">
            {docsList.map((d, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-3 border-b border-steel-50 last:border-0 hover:bg-steel-50/50 cursor-pointer">
                <FileText size={16} className="text-steel-400 flex-shrink-0" />
                <span className="text-sm text-navy-800 flex-1">{d.name}</span>
                <span className="text-xs text-steel-400">{d.size}</span>
              </div>
            ))}
          </div>
        )}

        {tab === 'Activity' && (
          <div className="bg-white rounded-lg border border-steel-200 p-5">
            <div className="space-y-4">
              {activityLog.map((a, i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-steel-300 mt-1.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-navy-800">{a.text}</p>
                    <p className="text-xs text-steel-400 mt-0.5">{a.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
