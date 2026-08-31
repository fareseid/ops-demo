import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAppState } from '@/hooks/useAppState';
import { StatusBadge, Button, Avatar, ConfirmDialog } from '@/components/ui';
import { formatCurrency } from '@/lib/utils';
import { Copy, Download, Send, CheckCircle2, FolderKanban, FileText, Pencil, Trash2, ArrowRight } from 'lucide-react';

export function QuotationDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { quotations, projects, updateQuotationStatus, deleteQuotation, addToast } = useAppState();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const q = quotations.find(q => q.id === id);

  if (!q) return <div className="p-8 text-steel-500">Quotation not found. <Link to="/quotations" className="text-navy-700 hover:underline">Back to Quotations</Link></div>;

  const subtotal = q.lineItems.reduce((s, li) => s + li.total, 0);
  const vatAmount = Math.round(subtotal * q.vat);
  const grandTotal = subtotal + vatAmount;
  const linkedProject = projects.find(p => p.quotationId === q.id) || (q.projectId ? projects.find(p => p.id === q.projectId) : undefined);

  const handleAccept = () => {
    updateQuotationStatus(q.id, 'Accepted');
    addToast(`Quotation ${q.id} marked as accepted.`);
  };

  const handleCreateProject = () => {
    if (linkedProject) { navigate(`/projects/${linkedProject.id}`); return; }
    navigate(`/projects/new?quotationId=${q.id}`);
  };

  const handleDelete = () => {
    deleteQuotation(q.id);
    addToast(`Quotation ${q.id} deleted.`, 'info');
    navigate('/quotations');
  };

  return (
    <div>
      <div className="flex items-center gap-2 text-sm text-steel-500 mb-4">
        <Link to="/quotations" className="hover:text-navy-700">Quotations</Link>
        <span>/</span>
        <span className="text-navy-900 font-medium">{q.id}</span>
      </div>

      {/* Header */}
      <div className="bg-white rounded-lg border border-steel-200 p-4 sm:p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-lg sm:text-xl font-semibold text-navy-900">{q.id}</h1>
              <StatusBadge status={q.status} />
            </div>
            <p className="text-base sm:text-lg text-navy-800 mt-1">{q.customer}</p>
            <p className="text-sm text-steel-500 mt-0.5">{q.project}</p>
          </div>
          <div className="sm:text-right">
            <p className="text-xl sm:text-2xl font-bold text-navy-900">{formatCurrency(grandTotal)}</p>
            <p className="text-xs text-steel-400 mt-1">incl. VAT ({(q.vat * 100).toFixed(0)}%)</p>
          </div>
        </div>

        {/* Metadata */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-5 border-t border-steel-100">
          <div>
            <p className="text-xs text-steel-400 uppercase font-semibold">Prepared by</p>
            <div className="flex items-center gap-2 mt-1">
              <Avatar name={q.owner} size="sm" />
              <span className="text-sm text-navy-800">{q.owner}</span>
            </div>
          </div>
          <div>
            <p className="text-xs text-steel-400 uppercase font-semibold">Customer Contact</p>
            <p className="text-sm text-navy-800 mt-1">{q.contactPerson || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-steel-400 uppercase font-semibold">Payment Terms</p>
            <p className="text-sm text-navy-800 mt-1">{q.paymentTerms}</p>
          </div>
          <div>
            <p className="text-xs text-steel-400 uppercase font-semibold">Delivery Timeframe</p>
            <p className="text-sm text-navy-800 mt-1">{q.deliveryTimeframe || '—'}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2 mt-5 pt-5 border-t border-steel-100">
          <Button variant="secondary" size="sm" onClick={() => navigate(`/quotations/${q.id}/edit`)}><Pencil size={14} /> Edit</Button>
          <Button variant="secondary" size="sm" onClick={() => addToast('Quotation duplicated.', 'info')}><Copy size={14} /> Duplicate</Button>
          <Button variant="secondary" size="sm" onClick={() => addToast('PDF downloaded.', 'info')}><Download size={14} /> Download PDF</Button>
          {q.status !== 'Accepted' && q.status !== 'Sent' && (
            <Button variant="secondary" size="sm" onClick={() => { updateQuotationStatus(q.id, 'Sent'); addToast('Quotation sent to customer.', 'success'); }}><Send size={14} /> Send</Button>
          )}
          {q.status !== 'Accepted' && (
            <Button size="sm" onClick={handleAccept}><CheckCircle2 size={14} /> Mark Accepted</Button>
          )}
          <Button variant="secondary" size="sm" onClick={() => setConfirmOpen(true)}><Trash2 size={14} /> Delete</Button>
        </div>
      </div>

      {/* Accepted CTA */}
      {q.status === 'Accepted' && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="text-emerald-600 flex-shrink-0" size={20} />
            <div>
              <p className="text-sm font-semibold text-emerald-800">Quotation Accepted</p>
              <p className="text-xs text-emerald-600">{linkedProject ? `Linked to project ${linkedProject.id}.` : 'Ready to convert into a project.'}</p>
            </div>
          </div>
          <Button size="sm" onClick={handleCreateProject}>
            <FolderKanban size={14} /> {linkedProject ? 'Open Project' : 'Create Project from Quotation'}
          </Button>
        </div>
      )}

      {/* Line Items */}
      <div className="bg-white rounded-lg border border-steel-200 overflow-hidden">
        <div className="px-4 sm:px-6 py-4 border-b border-steel-100">
          <h3 className="text-sm font-semibold text-navy-900">Line Items</h3>
        </div>
        {/* Desktop table */}
        <div className="hidden md:block">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-steel-100 bg-steel-50/50">
                <th className="text-left px-6 py-3 text-xs font-semibold text-steel-500 uppercase">Description</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-steel-500 uppercase">Qty</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-steel-500 uppercase">Unit</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-steel-500 uppercase">Unit Price</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-steel-500 uppercase">Total</th>
              </tr>
            </thead>
            <tbody>
              {q.lineItems.map((li, i) => (
                <tr key={i} className="border-b border-steel-50">
                  <td className="px-6 py-3 text-navy-800">{li.description}</td>
                  <td className="px-4 py-3 text-right text-steel-600">{li.qty}</td>
                  <td className="px-4 py-3 text-steel-500">{li.unit}</td>
                  <td className="px-4 py-3 text-right text-steel-600">{formatCurrency(li.unitPrice)}</td>
                  <td className="px-6 py-3 text-right font-medium text-navy-900">{formatCurrency(li.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Mobile line item cards */}
        <div className="md:hidden divide-y divide-steel-50">
          {q.lineItems.map((li, i) => (
            <div key={i} className="px-4 py-3">
              <div className="flex justify-between gap-3">
                <p className="text-sm text-navy-800 font-medium">{li.description}</p>
                <p className="text-sm font-semibold text-navy-900 whitespace-nowrap">{formatCurrency(li.total)}</p>
              </div>
              <p className="text-xs text-steel-500 mt-0.5">{li.qty} {li.unit} × {formatCurrency(li.unitPrice)}</p>
            </div>
          ))}
        </div>
        {/* Totals */}
        <div className="border-t border-steel-200 px-4 sm:px-6 py-3 flex justify-end">
          <div className="w-full sm:w-72 space-y-1.5">
            <div className="flex justify-between text-sm"><span className="text-steel-500">Subtotal</span><span className="font-medium text-navy-900">{formatCurrency(subtotal)}</span></div>
            <div className="flex justify-between text-sm"><span className="text-steel-500">VAT ({(q.vat * 100).toFixed(0)}%)</span><span className="text-steel-600">{formatCurrency(vatAmount)}</span></div>
            <div className="flex justify-between text-base pt-1.5 border-t border-steel-200"><span className="font-bold text-navy-900">Grand Total</span><span className="font-bold text-navy-900">{formatCurrency(grandTotal)}</span></div>
          </div>
        </div>
      </div>

      {q.notes && (
        <div className="bg-white rounded-lg border border-steel-200 p-5 mt-4">
          <p className="text-xs font-semibold text-steel-500 uppercase mb-1.5">Notes</p>
          <p className="text-sm text-steel-700">{q.notes}</p>
        </div>
      )}

      {/* Related links */}
      <div className="mt-4 flex flex-wrap gap-4 text-sm">
        {q.requestId && (
          <Link to={`/requests/${q.requestId}`} className="text-navy-700 font-medium hover:underline flex items-center gap-1">
            <FileText size={14} /> Request {q.requestId}
          </Link>
        )}
        {linkedProject && (
          <Link to={`/projects/${linkedProject.id}`} className="text-navy-700 font-medium hover:underline flex items-center gap-1">
            <FolderKanban size={14} /> Project {linkedProject.id} <ArrowRight size={12} />
          </Link>
        )}
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete this quotation?"
        message={`Are you sure you want to delete ${q.id}? This cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
