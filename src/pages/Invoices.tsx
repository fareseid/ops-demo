import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppState } from '@/hooks/useAppState';
import { PageHeader, StatusBadge, KPICard, SearchInput, SelectFilter, Modal, Button, FormField, Input, Textarea, FormSelect, FormActions, EmptyState, ConfirmDialog } from '@/components/ui';
import { InvoiceFormModal } from '@/components/forms';
import { formatCurrency, formatDate, TODAY } from '@/lib/utils';
import { PAYMENT_METHODS } from '@/data/options';
import { DollarSign, AlertTriangle, Clock, CheckCircle2, CreditCard, Plus, Pencil, Trash2 } from 'lucide-react';

export function Invoices() {
  const { invoices, recordPayment, deleteInvoice, addToast } = useAppState();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [payOpen, setPayOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [pay, setPay] = useState({ amount: '', method: 'Bank Transfer', reference: '', date: TODAY, notes: '' });
  const [payErr, setPayErr] = useState('');

  const selected = invoices.find(i => i.id === selectedId) || null;

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

  const openPay = () => { setPay({ amount: selected ? String(selected.balance) : '', method: 'Bank Transfer', reference: '', date: TODAY, notes: '' }); setPayErr(''); setPayOpen(true); };

  const handleRecordPayment = () => {
    if (!selected) return;
    const amt = parseFloat(pay.amount);
    if (isNaN(amt) || amt <= 0) { setPayErr('Enter a valid amount'); return; }
    if (amt > selected.balance) { setPayErr(`Amount exceeds outstanding balance (${formatCurrency(selected.balance)})`); return; }
    recordPayment(selected.id, amt, pay.method, pay.reference || 'N/A', pay.date, pay.notes || undefined);
    addToast(`Payment of ${formatCurrency(amt)} recorded for ${selected.id}.`);
    setPayOpen(false);
  };

  const doDelete = () => {
    if (confirmId) { deleteInvoice(confirmId); addToast('Invoice deleted.', 'info'); setConfirmId(null); setSelectedId(null); }
  };

  return (
    <div>
      <PageHeader
        title="Invoices & Receivables"
        subtitle="Billing and payment follow-up"
        actions={<Button onClick={() => setCreateOpen(true)}><Plus size={15} /> New Invoice</Button>}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <KPICard label="Total Outstanding" value={formatCurrency(totalOutstanding)} icon={<DollarSign size={18} />} />
        <KPICard label="Overdue" value={formatCurrency(overdue)} icon={<AlertTriangle size={18} />} />
        <KPICard label="Due / In Progress" value={formatCurrency(dueThisWeek)} icon={<Clock size={18} />} />
        <KPICard label="Received (total)" value={formatCurrency(receivedMonth)} icon={<CheckCircle2 size={18} />} />
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <SearchInput value={search} onChange={setSearch} placeholder="Search invoices..." />
        <SelectFilter value={statusFilter} onChange={setStatusFilter} options={statuses} placeholder="All Statuses" />
      </div>

      {/* Desktop table */}
      <div className="hidden md:block bg-white rounded-lg border border-steel-200 overflow-hidden">
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
              <tr key={inv.id} className="border-b border-steel-50 hover:bg-steel-50/50 cursor-pointer" onClick={() => setSelectedId(inv.id)}>
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
        {filtered.length === 0 && <EmptyState message="No invoices found." />}
        <div className="px-4 py-3 text-xs text-steel-400 border-t border-steel-100">{filtered.length} invoices</div>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {filtered.length === 0 && <div className="bg-white rounded-lg border border-steel-200"><EmptyState message="No invoices found." /></div>}
        {filtered.map(inv => (
          <button key={inv.id} onClick={() => setSelectedId(inv.id)} className="w-full text-left bg-white rounded-lg border border-steel-200 p-4 active:bg-steel-50">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-steel-500">{inv.id}</span>
              <StatusBadge status={inv.status} />
            </div>
            <p className="text-sm font-semibold text-navy-900 mt-1">{inv.customer}</p>
            <p className="text-sm text-steel-600">{inv.project}</p>
            <div className="flex items-center justify-between gap-2 mt-2">
              <span className="text-xs text-steel-400">Due {formatDate(inv.dueDate)}</span>
              <span className="text-sm font-semibold text-navy-900">Bal {formatCurrency(inv.balance)}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Detail Modal */}
      <Modal open={!!selected && !payOpen && !editOpen} onClose={() => setSelectedId(null)} title={selected?.id || ''} width="max-w-xl">
        {selected && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-steel-400 text-xs uppercase font-semibold">Customer</p><p className="text-navy-800 mt-0.5">{selected.customer}</p></div>
              <div><p className="text-steel-400 text-xs uppercase font-semibold">Project</p>
                {selected.projectId ? (
                  <Link to={`/projects/${selected.projectId}`} className="text-navy-700 font-medium hover:underline mt-0.5 block">{selected.project}</Link>
                ) : <p className="text-navy-800 mt-0.5">{selected.project}</p>}
              </div>
              <div><p className="text-steel-400 text-xs uppercase font-semibold">Invoice Date</p><p className="text-navy-800 mt-0.5">{formatDate(selected.invoiceDate)}</p></div>
              <div><p className="text-steel-400 text-xs uppercase font-semibold">Due Date</p><p className="text-navy-800 mt-0.5">{formatDate(selected.dueDate)}</p></div>
              <div><p className="text-steel-400 text-xs uppercase font-semibold">Status</p><StatusBadge status={selected.status} className="mt-1" /></div>
            </div>
            {selected.description && <p className="text-sm text-steel-600">{selected.description}</p>}

            <div className="grid grid-cols-3 gap-4 p-4 bg-steel-50 rounded-lg">
              <div className="text-center"><p className="text-xs text-steel-400 uppercase">Amount</p><p className="text-base sm:text-lg font-semibold text-navy-900 mt-1">{formatCurrency(selected.amount)}</p></div>
              <div className="text-center"><p className="text-xs text-steel-400 uppercase">Paid</p><p className="text-base sm:text-lg font-semibold text-emerald-600 mt-1">{formatCurrency(selected.paid)}</p></div>
              <div className="text-center"><p className="text-xs text-steel-400 uppercase">Outstanding</p><p className={`text-base sm:text-lg font-semibold mt-1 ${selected.balance > 0 ? 'text-red-600' : 'text-emerald-600'}`}>{formatCurrency(selected.balance)}</p></div>
            </div>

            {selected.payments.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-steel-500 uppercase mb-2">Payment History</p>
                {selected.payments.map((p, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-steel-50 text-sm last:border-0">
                    <div>
                      <p className="text-navy-800">{formatCurrency(p.amount)}</p>
                      <p className="text-xs text-steel-400">{p.method} — {p.reference}{p.notes ? ` · ${p.notes}` : ''}</p>
                    </div>
                    <span className="text-steel-500 text-xs">{formatDate(p.date)}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-wrap justify-end gap-2 pt-3 border-t border-steel-100">
              <Button variant="secondary" size="sm" onClick={() => setEditOpen(true)}><Pencil size={14} /> Edit</Button>
              <Button variant="secondary" size="sm" onClick={() => setConfirmId(selected.id)}><Trash2 size={14} /> Delete</Button>
              {selected.balance > 0 && (
                <Button size="sm" onClick={openPay}><CreditCard size={14} /> Record Payment</Button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Payment Modal */}
      <Modal open={payOpen} onClose={() => setPayOpen(false)} title="Record Payment">
        <div className="space-y-4">
          {selected && (
            <div className="text-sm text-steel-500">Outstanding balance: <span className="font-semibold text-navy-900">{formatCurrency(selected.balance)}</span></div>
          )}
          <FormField label="Amount (ZMW)" required error={payErr}>
            <Input type="number" min="0" value={pay.amount} onChange={e => { setPay(p => ({ ...p, amount: e.target.value })); setPayErr(''); }} placeholder={selected ? String(selected.balance) : ''} invalid={!!payErr} />
          </FormField>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Payment Date"><Input type="date" value={pay.date} onChange={e => setPay(p => ({ ...p, date: e.target.value }))} /></FormField>
            <FormField label="Payment Method"><FormSelect value={pay.method} onChange={v => setPay(p => ({ ...p, method: v }))} options={PAYMENT_METHODS} /></FormField>
          </div>
          <FormField label="Reference"><Input value={pay.reference} onChange={e => setPay(p => ({ ...p, reference: e.target.value }))} placeholder="Payment reference" /></FormField>
          <FormField label="Notes"><Textarea value={pay.notes} onChange={e => setPay(p => ({ ...p, notes: e.target.value }))} rows={2} placeholder="Optional notes…" /></FormField>
          <FormActions>
            <Button variant="secondary" size="sm" onClick={() => setPayOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={handleRecordPayment}>Record Payment</Button>
          </FormActions>
        </div>
      </Modal>

      {createOpen && <InvoiceFormModal open onClose={() => setCreateOpen(false)} />}
      {editOpen && selected && <InvoiceFormModal open onClose={() => setEditOpen(false)} editing={selected} />}
      <ConfirmDialog
        open={!!confirmId}
        title="Delete this invoice?"
        message={`Are you sure you want to delete ${confirmId}? This cannot be undone.`}
        onConfirm={doDelete}
        onCancel={() => setConfirmId(null)}
      />
    </div>
  );
}
