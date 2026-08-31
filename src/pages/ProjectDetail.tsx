import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAppState } from '@/hooks/useAppState';
import { StatusBadge, Button, ProgressBar, Tabs, Avatar, KPICard, ConfirmDialog, FormSelect, EmptyState } from '@/components/ui';
import { TaskFormModal, MaterialReqFormModal, PurchaseRequestFormModal, InvoiceFormModal } from '@/components/forms';
import { formatCurrency, formatDate } from '@/lib/utils';
import { PROJECT_STATUSES } from '@/data/options';
import {
  MapPin, Calendar, User, CheckCircle2, Circle, Clock, Receipt, FileText, ShoppingCart,
  AlertTriangle, Plus, Pencil, Trash2, ChevronRight,
} from 'lucide-react';
import type { ProjectTask, ProjectMaterial } from '@/data/mock';

export function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    projects, purchaseRequests, invoices, toggleProjectTask, deleteProjectTask,
    deleteProjectMaterial, updateProjectStatus, deleteProject, addToast,
  } = useAppState();
  const p = projects.find(p => p.id === id);
  const [tab, setTab] = useState('Overview');
  const [taskForm, setTaskForm] = useState<{ open: boolean; editing?: ProjectTask; index?: number }>({ open: false });
  const [matForm, setMatForm] = useState<{ open: boolean; editing?: ProjectMaterial; index?: number }>({ open: false });
  const [prForm, setPRForm] = useState<{ open: boolean; items?: { description: string; qty: string; unit: string }[] }>({ open: false });
  const [invoiceForm, setInvoiceForm] = useState(false);
  const [confirm, setConfirm] = useState<{ type: 'project' | 'task' | 'material'; index?: number } | null>(null);

  if (!p) return <div className="p-8 text-steel-500">Project not found. <Link to="/projects" className="text-navy-700 hover:underline">Back to Projects</Link></div>;

  const margin = p.costs.quotedRevenue - p.costs.materialCost - p.costs.labourCost - p.costs.transport - p.costs.otherCosts;
  const marginPct = p.costs.quotedRevenue ? ((margin / p.costs.quotedRevenue) * 100).toFixed(1) : '0';
  const projectPRs = purchaseRequests.filter(pr => pr.projectId === p.id);
  const projectInvoices = invoices.filter(inv => inv.projectId === p.id);
  const shortages = p.materials.filter(m => m.required > m.available && m.ordered <= 0);

  const shortageItems = (mats: ProjectMaterial[]) => mats.map(m => ({ description: m.item, qty: String(Math.max(m.required - m.available - m.ordered, 1)), unit: m.unit }));

  const doDelete = () => {
    if (!confirm) return;
    if (confirm.type === 'project') { deleteProject(p.id); addToast(`Project ${p.id} deleted.`, 'info'); navigate('/projects'); }
    else if (confirm.type === 'task' && confirm.index !== undefined) { deleteProjectTask(p.id, confirm.index); addToast('Task deleted.', 'info'); }
    else if (confirm.type === 'material' && confirm.index !== undefined) { deleteProjectMaterial(p.id, confirm.index); addToast('Material deleted.', 'info'); }
    setConfirm(null);
  };

  return (
    <div>
      <div className="flex items-center gap-2 text-sm text-steel-500 mb-4">
        <Link to="/projects" className="hover:text-navy-700">Projects & Jobs</Link>
        <span>/</span>
        <span className="text-navy-900 font-medium">{p.id}</span>
      </div>

      {/* Header */}
      <div className="bg-white rounded-lg border border-steel-200 p-4 sm:p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-lg sm:text-xl font-semibold text-navy-900">{p.project}</h1>
              <StatusBadge status={p.status} />
            </div>
            <p className="text-sm text-steel-600 mt-1">{p.customer}</p>
            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-1 sm:gap-4 mt-3 text-sm text-steel-500">
              <span className="flex items-center gap-1"><MapPin size={14} /> {p.location || '—'}</span>
              <span className="flex items-center gap-1"><Calendar size={14} /> {formatDate(p.startDate)} — {formatDate(p.targetCompletion)}</span>
              <span className="flex items-center gap-1"><User size={14} /> {p.projectManager || 'Unassigned'}</span>
            </div>
          </div>
          <div className="sm:text-right">
            <p className="text-xl sm:text-2xl font-bold text-navy-900">{formatCurrency(p.value)}</p>
            <div className="flex items-center gap-2 mt-2 sm:justify-end">
              <ProgressBar value={p.progress} className="w-32" />
              <span className="text-sm font-medium text-steel-600">{p.progress}%</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-steel-100">
          <div className="w-40">
            <FormSelect value={p.status} onChange={v => { updateProjectStatus(p.id, v as typeof p.status); addToast(`Status set to ${v}.`); }} options={[...PROJECT_STATUSES]} />
          </div>
          <Button variant="secondary" size="sm" onClick={() => navigate(`/projects/${p.id}/edit`)}><Pencil size={14} /> Edit</Button>
          {p.quotationId && (
            <Button variant="secondary" size="sm" onClick={() => navigate(`/quotations/${p.quotationId}`)}><Receipt size={14} /> Quotation</Button>
          )}
          <Button variant="secondary" size="sm" onClick={() => setTab('Invoices')}><FileText size={14} /> Invoices</Button>
          <Button variant="secondary" size="sm" onClick={() => setConfirm({ type: 'project' })}><Trash2 size={14} /> Delete</Button>
        </div>
      </div>

      <Tabs tabs={['Overview', 'Tasks', 'Materials', 'Team', 'Costs', 'Procurement', 'Invoices']} active={tab} onChange={setTab} />

      <div className="mt-6">
        {tab === 'Overview' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-steel-200 p-5">
              <h3 className="text-sm font-semibold text-navy-900 mb-2">Scope of Work</h3>
              <p className="text-sm text-steel-700 leading-relaxed">{p.scope || '—'}</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <InfoCard label="Customer Contact" value={p.customerContact || '—'} />
              <InfoCard label="Project Manager" value={p.projectManager || '—'} />
              <InfoCard label="Category" value={p.category} />
              <InfoCard label="Target Completion" value={formatDate(p.targetCompletion)} />
            </div>
          </div>
        )}

        {tab === 'Tasks' && (
          <div>
            <div className="flex justify-end mb-3">
              <Button size="sm" onClick={() => setTaskForm({ open: true })}><Plus size={14} /> Add Task</Button>
            </div>
            <div className="bg-white rounded-lg border border-steel-200">
              {p.tasks.length === 0 && <EmptyState message="No tasks yet. Add the first task to track progress." />}
              {p.tasks.map((t, i) => (
                <div key={i} className="flex items-center gap-3 px-4 sm:px-5 py-3.5 border-b border-steel-50 last:border-0 hover:bg-steel-50/50">
                  <button onClick={() => { toggleProjectTask(p.id, i); }} className="flex-shrink-0" title="Toggle status">
                    {t.status === 'Complete' ? <CheckCircle2 size={18} className="text-emerald-500" />
                      : t.status === 'In Progress' ? <Clock size={18} className="text-copper-500" />
                      : <Circle size={18} className="text-steel-300" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${t.status === 'Complete' ? 'text-steel-400 line-through' : 'text-navy-800'}`}>{t.name}</p>
                    <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5 text-xs text-steel-400">
                      {t.assignedTo && <span>{t.assignedTo}</span>}
                      {t.dueDate && <span>Due {formatDate(t.dueDate)}</span>}
                      {t.priority && <span>{t.priority} priority</span>}
                    </div>
                  </div>
                  <StatusBadge status={t.status} className="hidden sm:inline-flex" />
                  <button onClick={() => setTaskForm({ open: true, editing: t, index: i })} className="text-steel-400 hover:text-navy-700 p-1"><Pencil size={14} /></button>
                  <button onClick={() => setConfirm({ type: 'task', index: i })} className="text-steel-400 hover:text-red-600 p-1"><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'Materials' && (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              {shortages.length > 0 ? (
                <div className="flex items-center gap-2 text-sm text-amber-700">
                  <AlertTriangle size={15} /> {shortages.length} material{shortages.length > 1 ? 's' : ''} short of requirement.
                </div>
              ) : <div />}
              <div className="flex gap-2">
                {shortages.length > 0 && (
                  <Button variant="secondary" size="sm" onClick={() => setPRForm({ open: true, items: shortageItems(shortages) })}>
                    <ShoppingCart size={14} /> Create Purchase Request
                  </Button>
                )}
                <Button size="sm" onClick={() => setMatForm({ open: true })}><Plus size={14} /> Add Material</Button>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-steel-200 overflow-hidden">
              {p.materials.length === 0 && <EmptyState message="No material requirements yet." />}
              {/* Desktop table */}
              {p.materials.length > 0 && (
                <table className="hidden md:table w-full text-sm">
                  <thead>
                    <tr className="border-b border-steel-100 bg-steel-50/50">
                      <th className="text-left px-5 py-3 text-xs font-semibold text-steel-500 uppercase">Item</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-steel-500 uppercase">Required</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-steel-500 uppercase">Available</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-steel-500 uppercase">Ordered</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-steel-500 uppercase">Status</th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {p.materials.map((m, i) => (
                      <tr key={i} className="border-b border-steel-50">
                        <td className="px-5 py-3 text-navy-800 font-medium">{m.item}<span className="text-steel-400 font-normal"> · {m.unit}</span></td>
                        <td className="px-4 py-3 text-right text-steel-600">{m.required}</td>
                        <td className={`px-4 py-3 text-right font-medium ${m.available < m.required ? 'text-red-600' : 'text-emerald-600'}`}>{m.available}</td>
                        <td className="px-4 py-3 text-right text-steel-500">{m.ordered}</td>
                        <td className="px-4 py-3"><StatusBadge status={m.status} /></td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            {m.required > m.available && m.ordered <= 0 && (
                              <button onClick={() => setPRForm({ open: true, items: shortageItems([m]) })} className="text-xs text-copper-600 font-medium hover:underline mr-1">Create PR</button>
                            )}
                            <button onClick={() => setMatForm({ open: true, editing: m, index: i })} className="text-steel-400 hover:text-navy-700 p-1"><Pencil size={14} /></button>
                            <button onClick={() => setConfirm({ type: 'material', index: i })} className="text-steel-400 hover:text-red-600 p-1"><Trash2 size={14} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {/* Mobile cards */}
              <div className="md:hidden divide-y divide-steel-50">
                {p.materials.map((m, i) => (
                  <div key={i} className="p-4">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-navy-800">{m.item}</p>
                      <StatusBadge status={m.status} />
                    </div>
                    <div className="flex gap-4 mt-1.5 text-xs text-steel-500">
                      <span>Req: <b className="text-steel-700">{m.required}</b></span>
                      <span>Avail: <b className={m.available < m.required ? 'text-red-600' : 'text-emerald-600'}>{m.available}</b></span>
                      <span>Ord: <b className="text-steel-700">{m.ordered}</b></span>
                      <span>{m.unit}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-2.5">
                      {m.required > m.available && m.ordered <= 0 && (
                        <button onClick={() => setPRForm({ open: true, items: shortageItems([m]) })} className="text-xs text-copper-600 font-medium">Create PR</button>
                      )}
                      <button onClick={() => setMatForm({ open: true, editing: m, index: i })} className="text-xs text-navy-700 font-medium ml-auto">Edit</button>
                      <button onClick={() => setConfirm({ type: 'material', index: i })} className="text-xs text-red-600 font-medium">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === 'Team' && (
          <div className="bg-white rounded-lg border border-steel-200">
            {p.team.length === 0 && <EmptyState message="No team members assigned." />}
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
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <KPICard label="Quoted Revenue" value={formatCurrency(p.costs.quotedRevenue)} />
            <KPICard label="Material Cost" value={formatCurrency(p.costs.materialCost)} />
            <KPICard label="Labour Cost" value={formatCurrency(p.costs.labourCost)} />
            <KPICard label="Transport" value={formatCurrency(p.costs.transport)} />
            <KPICard label="Other Costs" value={formatCurrency(p.costs.otherCosts)} />
            <div className={`bg-white rounded-lg border p-4 sm:p-5 ${Number(marginPct) > 0 ? 'border-emerald-200' : 'border-red-200'}`}>
              <p className="text-xs sm:text-sm text-steel-500 font-medium">Estimated Margin</p>
              <p className={`text-lg sm:text-2xl font-semibold mt-1 ${Number(marginPct) > 0 ? 'text-emerald-600' : 'text-red-600'}`}>{formatCurrency(margin)}</p>
              <p className="text-xs text-steel-400 mt-1">{marginPct}% margin</p>
            </div>
          </div>
        )}

        {tab === 'Procurement' && (
          <div className="bg-white rounded-lg border border-steel-200">
            {projectPRs.length === 0 ? <EmptyState message="No purchase requests linked to this project yet." /> : (
              projectPRs.map(pr => (
                <button key={pr.id} onClick={() => navigate('/procurement')} className="w-full flex items-center gap-3 px-5 py-3.5 border-b border-steel-50 last:border-0 hover:bg-steel-50/50 text-left">
                  <ShoppingCart size={16} className="text-steel-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-navy-900">{pr.id}{pr.poNumber ? ` · ${pr.poNumber}` : ''}</p>
                    <p className="text-xs text-steel-500">{pr.supplier} · {formatCurrency(pr.value)}</p>
                  </div>
                  <StatusBadge status={pr.status} />
                  <ChevronRight size={15} className="text-steel-400" />
                </button>
              ))
            )}
          </div>
        )}

        {tab === 'Invoices' && (
          <div>
          <div className="flex justify-end mb-3">
            <Button size="sm" onClick={() => setInvoiceForm(true)}><Plus size={14} /> New Invoice</Button>
          </div>
          <div className="bg-white rounded-lg border border-steel-200">
            {projectInvoices.length === 0 ? <EmptyState message="No invoices for this project yet." /> : (
              projectInvoices.map(inv => (
                <button key={inv.id} onClick={() => navigate('/invoices')} className="w-full flex items-center gap-3 px-5 py-3.5 border-b border-steel-50 last:border-0 hover:bg-steel-50/50 text-left">
                  <Receipt size={16} className="text-steel-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-navy-900">{inv.id}</p>
                    <p className="text-xs text-steel-500">Balance {formatCurrency(inv.balance)} of {formatCurrency(inv.amount)}</p>
                  </div>
                  <StatusBadge status={inv.status} />
                  <ChevronRight size={15} className="text-steel-400" />
                </button>
              ))
            )}
          </div>
          </div>
        )}
      </div>

      {taskForm.open && <TaskFormModal open onClose={() => setTaskForm({ open: false })} projectId={p.id} editing={taskForm.editing} index={taskForm.index} />}
      {matForm.open && <MaterialReqFormModal open onClose={() => setMatForm({ open: false })} projectId={p.id} editing={matForm.editing} index={matForm.index} />}
      {prForm.open && <PurchaseRequestFormModal open onClose={() => setPRForm({ open: false })} presetProject={{ id: p.id, name: p.project }} presetItems={prForm.items} />}
      {invoiceForm && <InvoiceFormModal open onClose={() => setInvoiceForm(false)} presetProjectId={p.id} />}
      <ConfirmDialog
        open={!!confirm}
        title={confirm?.type === 'project' ? 'Delete this project?' : confirm?.type === 'task' ? 'Delete this task?' : 'Delete this material?'}
        message={confirm?.type === 'project' ? `Are you sure you want to delete ${p.id}? This cannot be undone.` : 'Are you sure? This cannot be undone.'}
        onConfirm={doDelete}
        onCancel={() => setConfirm(null)}
      />
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-lg border border-steel-200 p-4">
      <p className="text-xs text-steel-400 uppercase font-semibold">{label}</p>
      <p className="text-sm text-navy-800 mt-1">{value}</p>
    </div>
  );
}
