import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppState } from '@/hooks/useAppState';
import { PageHeader, StatusBadge, KPICard, SearchInput, SelectFilter, Modal, Button } from '@/components/ui';
import { formatCurrency, formatDate } from '@/lib/utils';
import { DollarSign, AlertTriangle, Clock, CheckCircle2, CreditCard } from 'lucide-react';
import type { Invoice } from '@/data/mock';

export function Invoices() {
  const { invoices, recordPayment, addToast } = useAppState();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selected, setSelected] = useState<Invoice | null>(null);
  const [payModal, setPayModal] = useState(false);
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('Bank Transfer');
  const [payRef, setPayRef] = useState('');

  const statuses = [...new Set(invoices.map(i => i.status))];
  const filtered = invoices.filter(i => {
    if (search && !`${i.id} ${i.customer} ${i.project}`.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter && i.status !== statusFilter) return false;
    return true;
  });

  const totalOutstanding = invoices.reduce((s, i) => s + i.balance, 0);
  const overdue = invoices.filter(i => i.status === 'Overdue').reduce((s, i) => s + i.balance, 0);
  const dueThisWeek = invoices.filter(i => i.status === 'Sent' || i.status === 'Partially Paid').reduce((s, i) => s + i.balance, 0);
  const receivedMonth = invoices.reduce((s, i) => s + i.paid, 0);

  const handleRecordPayment = () => {
    if (!selected || !payAmount) return;
    recordPayment(selected.id, parseFloat(payAmount), payMethod, payRef || 'N/A');
    addToast(`Payment of ZMW ${parseFloat(payAmount).toLocaleString()} recorded for ${selected.id}.`);
    setPayModal(false);
    setPayAmount('');
    setPayRef('');
    // Refresh selected
    setSelected(prev => prev ? invoices.find(i => i.id === prev.id) || prev : null);
  };

  return (
    <div>
      <PageHeader title="Invoices & Receivables" subtitle="Billing and payment follow-up" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPICard label="Total Outstanding" value={formatCurrency(totalOutstanding)} icon={<DollarSign size={18} />} />
        <KPICard label="Overdue" value={formatCurrency(overdue)} icon={<AlertTriangle size={18} />} />
        <KPICard label="Due This Week" value={formatCurrency(dueThisWeek)} icon={<Clock size={18} />} />
        <KPICard label="Received This Month" value={formatCurrency(receivedMonth)} icon={<CheckCircle2 size={18} />} />
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <SearchInput value={search} onChange={setSearch} placeholder="Search invoices..." />
        <SelectFilter value={statusFilter} onChange={setStatusFilter} options={statuses} placeholder="All Statuses" />
      </div>

      <div className="bg-white rounded-lg border border-steel-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-steel-100 bg-steel-50/50">
              <th className="text-left px-4 py-3 text-xs font-semibold text-steel-500 uppercase">Invoice #</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-steel-500 uppercase">Customer</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-steel-500 uppercase">Project</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-steel-500 uppercase">Due Date</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-steel-500 uppercase">Amount</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-steel-500 uppercase">Paid</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-steel-500 uppercase">Balance</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-steel-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(inv => (
              <tr key={inv.id} className="border-b border-steel-50 hover:bg-steel-50/50 cursor-pointer" onClick={() => setSelected(inv)}>
                <td className="px-4 py-3 font-medium text-navy-900">{inv.id}</td>
                <td className="px-4 py-3 text-navy-800">{inv.customer}</td>
                <td className="px-4 py-3 text-steel-600">{inv.project}</td>
                <td className="px-4 py-3 text-steel-500">{formatDate(inv.dueDate)}</td>
                <td className="px-4 py-3 text-right text-navy-900">{formatCurrency(inv.amount)}</td>
                <td className="px-4 py-3 text-right text-emerald-600">{formatCurrency(inv.paid)}</td>
                <td className={`px-4 py-3 text-right font-medium ${inv.balance > 0 ? 'text-navy-900' : 'text-emerald-600'}`}>{formatCurrency(inv.balance)}</td>
                <td className="px-4 py-3"><StatusBadge status={inv.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-4 py-3 text-xs text-steel-400 border-t border-steel-100">
          {filtered.length} invoices
        </div>
      </div>

      {/* Detail Modal */}
      <Modal open={!!selected && !payModal} onClose={() => setSelected(null)} title={selected?.id || ''} width="max-w-xl">
        {selected && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-steel-400 text-xs uppercase font-semibold">Customer</p><p className="text-navy-800 mt-0.5">{selected.customer}</p></div>
              <div><p className="text-steel-400 text-xs uppercase font-semibold">Project</p>
                {selected.projectId ? (
                  <Link to={`/projects/${selected.projectId}`} className="text-navy-700 font-medium hover:underline mt-0.5 block">{selected.project}</Link>
                ) : (
                  <p className="text-navy-800 mt-0.5">{selected.project}</p>
                )}
              </div>
              <div><p className="text-steel-400 text-xs uppercase font-semibold">Due Date</p><p className="text-navy-800 mt-0.5">{formatDate(selected.dueDate)}</p></div>
              <div><p className="text-steel-400 text-xs uppercase font-semibold">Status</p><StatusBadge status={selected.status} className="mt-1" /></div>
            </div>

            <div className="grid grid-cols-3 gap-4 p-4 bg-steel-50 rounded-lg">
              <div className="text-center">
                <p className="text-xs text-steel-400 uppercase">Amount</p>
                <p className="text-lg font-semibold text-navy-900 mt-1">{formatCurrency(selected.amount)}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-steel-400 uppercase">Paid</p>
                <p className="text-lg font-semibold text-emerald-600 mt-1">{formatCurrency(selected.paid)}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-steel-400 uppercase">Outstanding</p>
                <p className={`text-lg font-semibold mt-1 ${selected.balance > 0 ? 'text-red-600' : 'text-emerald-600'}`}>{formatCurrency(selected.balance)}</p>
              </div>
            </div>

            {selected.payments.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-steel-500 uppercase mb-2">Payment History</p>
                {selected.payments.map((pay, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-steel-50 text-sm last:border-0">
                    <div>
                      <p className="text-navy-800">{formatCurrency(pay.amount)}</p>
                      <p className="text-xs text-steel-400">{pay.method} — {pay.reference}</p>
                    </div>
                    <span className="text-steel-500 text-xs">{formatDate(pay.date)}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-3 border-t border-steel-100">
              <Button variant="secondary" size="sm" onClick={() => setSelected(null)}>Close</Button>
              {selected.balance > 0 && (
                <Button size="sm" onClick={() => setPayModal(true)}>
                  <CreditCard size={14} /> Record Payment
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Payment Modal */}
      <Modal open={payModal} onClose={() => setPayModal(false)} title="Record Payment">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-steel-500 uppercase mb-1">Amount (ZMW)</label>
            <input
              type="number"
              value={payAmount}
              onChange={e => setPayAmount(e.target.value)}
              placeholder={selected ? selected.balance.toString() : ''}
              className="w-full px-3 py-2 text-sm border border-steel-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-200"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-steel-500 uppercase mb-1">Method</label>
            <select value={payMethod} onChange={e => setPayMethod(e.target.value)} className="w-full px-3 py-2 text-sm border border-steel-200 rounded-lg">
              <option>Bank Transfer</option>
              <option>Cheque</option>
              <option>Cash</option>
              <option>Mobile Money</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-steel-500 uppercase mb-1">Reference</label>
            <input
              type="text"
              value={payRef}
              onChange={e => setPayRef(e.target.value)}
              placeholder="Payment reference"
              className="w-full px-3 py-2 text-sm border border-steel-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-200"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" size="sm" onClick={() => setPayModal(false)}>Cancel</Button>
            <Button size="sm" onClick={handleRecordPayment} disabled={!payAmount}>Record Payment</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
