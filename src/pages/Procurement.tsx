import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppState } from '@/hooks/useAppState';
import { PageHeader, StatusBadge, Button, KPICard, SearchInput, SelectFilter, Modal, EmptyState } from '@/components/ui';
import { PurchaseRequestFormModal } from '@/components/forms';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ShoppingCart, Clock, Truck, DollarSign, CheckCircle2, FileText, ArrowRight, Plus, PackageCheck } from 'lucide-react';
import type { PurchaseRequest } from '@/data/mock';

export function Procurement() {
  const { purchaseRequests, approvePR, rejectPR, convertToPO, markPRReceived, addToast } = useAppState();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const selected = purchaseRequests.find(pr => pr.id === selectedId) || null;

  const filtered = purchaseRequests.filter(pr => {
    if (search && !`${pr.id} ${pr.project} ${pr.supplier} ${pr.poNumber || ''}`.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter && pr.status !== statusFilter) return false;
    return true;
  });
  const statuses = [...new Set(purchaseRequests.map(pr => pr.status))];

  const awaitingApproval = purchaseRequests.filter(pr => pr.status === 'Approval Required').length;
  const openPOs = purchaseRequests.filter(pr => pr.status === 'PO Issued').length;
  const awaitingDelivery = purchaseRequests.filter(pr => ['PO Issued', 'Partially Received'].includes(pr.status)).length;
  const totalSpend = purchaseRequests.filter(pr => !['Draft', 'Approval Required'].includes(pr.status)).reduce((s, pr) => s + pr.value, 0);

  const handleConvert = (pr: PurchaseRequest) => {
    const po = convertToPO(pr.id);
    addToast(`${po} issued for ${pr.id}.`);
  };
  const handleReceive = (pr: PurchaseRequest) => {
    markPRReceived(pr.id);
    addToast(`${pr.poNumber || pr.id} marked received — stock updated.`);
  };

  return (
    <div>
      <PageHeader
        title="Procurement"
        subtitle="Purchase requests and orders"
        actions={<Button onClick={() => setCreateOpen(true)}><Plus size={15} /> New Purchase Request</Button>}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <KPICard label="Awaiting Approval" value={awaitingApproval} icon={<Clock size={18} />} />
        <KPICard label="Open Purchase Orders" value={openPOs} icon={<ShoppingCart size={18} />} />
        <KPICard label="Awaiting Delivery" value={awaitingDelivery} icon={<Truck size={18} />} />
        <KPICard label="Committed Spend" value={formatCurrency(totalSpend)} icon={<DollarSign size={18} />} />
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <SearchInput value={search} onChange={setSearch} placeholder="Search procurement..." />
        <SelectFilter value={statusFilter} onChange={setStatusFilter} options={statuses} placeholder="All Statuses" />
      </div>

      {/* Desktop table */}
      <div className="hidden md:block bg-white rounded-lg border border-steel-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-steel-100 bg-steel-50/50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-steel-500 uppercase">PR / PO #</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-steel-500 uppercase">Project</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-steel-500 uppercase">Supplier</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-steel-500 uppercase">Value</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-steel-500 uppercase">Required By</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-steel-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(pr => (
                <tr key={pr.id} className="border-b border-steel-50 hover:bg-steel-50/50 cursor-pointer" onClick={() => setSelectedId(pr.id)}>
                  <td className="px-4 py-3 font-medium text-navy-900">{pr.id}{pr.poNumber && <span className="block text-xs text-steel-400 font-normal">{pr.poNumber}</span>}</td>
                  <td className="px-4 py-3 text-steel-600">{pr.project}</td>
                  <td className="px-4 py-3 text-steel-600">{pr.supplier}</td>
                  <td className="px-4 py-3 text-right font-medium text-navy-900">{formatCurrency(pr.value)}</td>
                  <td className="px-4 py-3 text-steel-500">{formatDate(pr.requiredBy)}</td>
                  <td className="px-4 py-3"><StatusBadge status={pr.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && <EmptyState message="No purchase requests found." />}
        <div className="px-4 py-3 text-xs text-steel-400 border-t border-steel-100">{filtered.length} purchase requests</div>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {filtered.length === 0 && <div className="bg-white rounded-lg border border-steel-200"><EmptyState message="No purchase requests found." /></div>}
        {filtered.map(pr => (
          <button key={pr.id} onClick={() => setSelectedId(pr.id)} className="w-full text-left bg-white rounded-lg border border-steel-200 p-4 active:bg-steel-50">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-steel-500">{pr.id}{pr.poNumber ? ` · ${pr.poNumber}` : ''}</span>
              <StatusBadge status={pr.status} />
            </div>
            <p className="text-sm font-semibold text-navy-900 mt-1">{pr.project}</p>
            <p className="text-sm text-steel-600">{pr.supplier}</p>
            <div className="flex items-center justify-between gap-2 mt-2">
              <span className="text-xs text-steel-400">Req {formatDate(pr.requiredBy)}</span>
              <span className="text-sm font-semibold text-navy-900">{formatCurrency(pr.value)}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Detail Modal */}
      <Modal open={!!selected} onClose={() => setSelectedId(null)} title={selected?.id || ''} width="max-w-xl">
        {selected && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm text-steel-500">Project</p>
                <Link to={`/projects/${selected.projectId}`} className="text-sm font-medium text-navy-700 hover:underline flex items-center gap-1">
                  {selected.project} <ArrowRight size={12} />
                </Link>
              </div>
              <StatusBadge status={selected.status} />
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <Field label="Requested By" value={selected.requestedBy} />
              <Field label="Supplier" value={selected.supplier} />
              <Field label="Required By" value={formatDate(selected.requiredBy)} />
              <Field label="Est. Cost" value={formatCurrency(selected.value)} strong />
              {selected.poNumber && <Field label="PO Number" value={selected.poNumber} strong />}
            </div>

            <div>
              <p className="text-xs font-semibold text-steel-500 uppercase mb-2">Items</p>
              <div className="bg-steel-50 rounded-lg p-3 space-y-1.5">
                {selected.items.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-navy-800">{item.description}</span>
                    <span className="text-steel-500">{item.qty}</span>
                  </div>
                ))}
              </div>
            </div>

            {selected.notes && <p className="text-sm text-steel-600 italic">{selected.notes}</p>}

            <div className="flex flex-wrap justify-end gap-2 pt-3 border-t border-steel-100">
              {selected.status === 'Approval Required' && (
                <>
                  <Button variant="danger" size="sm" onClick={() => { rejectPR(selected.id); addToast(`${selected.id} rejected.`, 'error'); setSelectedId(null); }}>Reject</Button>
                  <Button size="sm" onClick={() => { approvePR(selected.id); addToast(`${selected.id} approved.`); }}><CheckCircle2 size={14} /> Approve</Button>
                </>
              )}
              {selected.status === 'Approved' && (
                <Button size="sm" onClick={() => handleConvert(selected)}><FileText size={14} /> Convert to Purchase Order</Button>
              )}
              {selected.status === 'PO Issued' && (
                <Button size="sm" onClick={() => { handleReceive(selected); setSelectedId(null); }}><PackageCheck size={14} /> Mark as Received</Button>
              )}
              {selected.status === 'PO Issued' && (
                <Button variant="secondary" size="sm" onClick={() => navigate(`/projects/${selected.projectId}`)}>View Project</Button>
              )}
              {['Received', 'Draft', 'Partially Received'].includes(selected.status) && (
                <Button variant="secondary" size="sm" onClick={() => setSelectedId(null)}>Close</Button>
              )}
            </div>
          </div>
        )}
      </Modal>

      <PurchaseRequestFormModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  );
}

function Field({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div>
      <p className="text-steel-400 text-xs uppercase font-semibold">{label}</p>
      <p className={`mt-0.5 ${strong ? 'text-navy-900 font-semibold' : 'text-navy-800'}`}>{value}</p>
    </div>
  );
}
