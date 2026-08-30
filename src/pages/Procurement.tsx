import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppState } from '@/hooks/useAppState';
import { PageHeader, StatusBadge, Button, KPICard, SearchInput, Modal } from '@/components/ui';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ShoppingCart, Clock, Truck, DollarSign, CheckCircle2, FileText, ArrowRight } from 'lucide-react';
import type { PurchaseRequest } from '@/data/mock';

export function Procurement() {
  const { purchaseRequests, updatePRStatus, addToast } = useAppState();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<PurchaseRequest | null>(null);

  const filtered = purchaseRequests.filter(pr =>
    !search || `${pr.id} ${pr.project} ${pr.supplier}`.toLowerCase().includes(search.toLowerCase())
  );

  const awaitingApproval = purchaseRequests.filter(pr => pr.status === 'Approval Required').length;
  const openPOs = purchaseRequests.filter(pr => pr.status === 'PO Issued').length;
  const awaitingDelivery = purchaseRequests.filter(pr => ['PO Issued', 'Partially Received'].includes(pr.status)).length;
  const totalSpend = purchaseRequests.filter(pr => !['Draft', 'Approval Required'].includes(pr.status)).reduce((s, pr) => s + pr.value, 0);

  return (
    <div>
      <PageHeader title="Procurement" subtitle="Purchase requests and orders" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPICard label="Awaiting Approval" value={awaitingApproval} icon={<Clock size={18} />} />
        <KPICard label="Open Purchase Orders" value={openPOs} icon={<ShoppingCart size={18} />} />
        <KPICard label="Awaiting Delivery" value={awaitingDelivery} icon={<Truck size={18} />} />
        <KPICard label="Monthly Spend" value={formatCurrency(totalSpend)} icon={<DollarSign size={18} />} />
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <SearchInput value={search} onChange={setSearch} placeholder="Search procurement..." />
      </div>

      <div className="bg-white rounded-lg border border-steel-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-steel-100 bg-steel-50/50">
              <th className="text-left px-4 py-3 text-xs font-semibold text-steel-500 uppercase">PR #</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-steel-500 uppercase">Project</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-steel-500 uppercase">Requested By</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-steel-500 uppercase">Supplier</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-steel-500 uppercase">Value</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-steel-500 uppercase">Required By</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-steel-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(pr => (
              <tr key={pr.id} className="border-b border-steel-50 hover:bg-steel-50/50 cursor-pointer" onClick={() => setSelected(pr)}>
                <td className="px-4 py-3 font-medium text-navy-900">{pr.id}</td>
                <td className="px-4 py-3 text-steel-600">{pr.project}</td>
                <td className="px-4 py-3 text-steel-600">{pr.requestedBy}</td>
                <td className="px-4 py-3 text-steel-600">{pr.supplier}</td>
                <td className="px-4 py-3 text-right font-medium text-navy-900">{formatCurrency(pr.value)}</td>
                <td className="px-4 py-3 text-steel-500">{formatDate(pr.requiredBy)}</td>
                <td className="px-4 py-3"><StatusBadge status={pr.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-4 py-3 text-xs text-steel-400 border-t border-steel-100">
          {filtered.length} purchase requests
        </div>
      </div>

      {/* Detail Modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected?.id || ''} width="max-w-xl">
        {selected && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-steel-500">Project</p>
                <Link to={`/projects/${selected.projectId}`} className="text-sm font-medium text-navy-700 hover:underline flex items-center gap-1">
                  {selected.project} <ArrowRight size={12} />
                </Link>
              </div>
              <StatusBadge status={selected.status} />
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><p className="text-steel-400 text-xs uppercase font-semibold">Requested By</p><p className="text-navy-800 mt-0.5">{selected.requestedBy}</p></div>
              <div><p className="text-steel-400 text-xs uppercase font-semibold">Supplier</p><p className="text-navy-800 mt-0.5">{selected.supplier}</p></div>
              <div><p className="text-steel-400 text-xs uppercase font-semibold">Required By</p><p className="text-navy-800 mt-0.5">{formatDate(selected.requiredBy)}</p></div>
              <div><p className="text-steel-400 text-xs uppercase font-semibold">Est. Cost</p><p className="text-navy-900 font-semibold mt-0.5">{formatCurrency(selected.value)}</p></div>
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

            <div className="flex justify-end gap-2 pt-3 border-t border-steel-100">
              {selected.status === 'Approval Required' && (
                <>
                  <Button variant="danger" size="sm" onClick={() => { updatePRStatus(selected.id, 'Draft'); addToast(`${selected.id} rejected.`, 'error'); setSelected(null); }}>
                    Reject
                  </Button>
                  <Button size="sm" onClick={() => { updatePRStatus(selected.id, 'Approved'); addToast(`${selected.id} approved.`); setSelected(null); }}>
                    <CheckCircle2 size={14} /> Approve
                  </Button>
                </>
              )}
              {selected.status === 'Approved' && (
                <Button size="sm" onClick={() => { updatePRStatus(selected.id, 'PO Issued'); addToast(`Purchase Order issued for ${selected.id}.`); setSelected(null); }}>
                  <FileText size={14} /> Convert to Purchase Order
                </Button>
              )}
              {!['Approval Required', 'Approved'].includes(selected.status) && (
                <Button variant="secondary" size="sm" onClick={() => setSelected(null)}>Close</Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
