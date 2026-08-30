import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAppState } from '@/hooks/useAppState';
import { PageHeader, StatusBadge, Button, Avatar } from '@/components/ui';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ArrowLeft, Copy, Download, Send, CheckCircle2, FolderKanban, FileText } from 'lucide-react';

export function QuotationDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { quotations, updateQuotationStatus, addToast } = useAppState();
  const q = quotations.find(q => q.id === id);

  if (!q) return <div className="p-8 text-steel-500">Quotation not found.</div>;

  const subtotal = q.lineItems.reduce((s, li) => s + li.total, 0);
  const vatAmount = Math.round(subtotal * q.vat);
  const grandTotal = subtotal + vatAmount;

  const handleAccept = () => {
    updateQuotationStatus(q.id, 'Accepted');
    addToast(`Quotation ${q.id} marked as accepted.`);
  };

  return (
    <div>
      {/* Breadcrumb */}
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
            <p className="text-sm text-navy-800 mt-1">{q.contactPerson}</p>
          </div>
          <div>
            <p className="text-xs text-steel-400 uppercase font-semibold">Payment Terms</p>
            <p className="text-sm text-navy-800 mt-1">{q.paymentTerms}</p>
          </div>
          <div>
            <p className="text-xs text-steel-400 uppercase font-semibold">Delivery Timeframe</p>
            <p className="text-sm text-navy-800 mt-1">{q.deliveryTimeframe}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2 mt-5 pt-5 border-t border-steel-100">
          <Button variant="secondary" size="sm" onClick={() => addToast('Quotation duplicated.', 'info')}><Copy size={14} /> Duplicate</Button>
          <Button variant="secondary" size="sm" onClick={() => addToast('PDF downloaded.', 'info')}><Download size={14} /> Download PDF</Button>
          <Button variant="secondary" size="sm" onClick={() => addToast('Quotation sent to customer.', 'success')}><Send size={14} /> Send to Customer</Button>
          {q.status !== 'Accepted' && (
            <Button size="sm" onClick={handleAccept}><CheckCircle2 size={14} /> Mark Accepted</Button>
          )}
        </div>
      </div>

      {/* Accepted CTA */}
      {q.status === 'Accepted' && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="text-emerald-600" size={20} />
            <div>
              <p className="text-sm font-semibold text-emerald-800">Quotation Accepted</p>
              <p className="text-xs text-emerald-600">This quotation has been accepted by the customer.</p>
            </div>
          </div>
          <Button size="sm" onClick={() => navigate('/projects/PRJ-2026-018')}>
            <FolderKanban size={14} /> Create Project from Quotation
          </Button>
        </div>
      )}

      {/* Line Items */}
      <div className="bg-white rounded-lg border border-steel-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-steel-100">
          <h3 className="text-sm font-semibold text-navy-900">Line Items</h3>
        </div>
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
          <tfoot>
            <tr className="border-t border-steel-200">
              <td colSpan={4} className="px-6 py-3 text-right text-sm font-medium text-steel-600">Subtotal</td>
              <td className="px-6 py-3 text-right font-semibold text-navy-900">{formatCurrency(subtotal)}</td>
            </tr>
            <tr>
              <td colSpan={4} className="px-6 py-2 text-right text-sm text-steel-500">VAT ({(q.vat * 100).toFixed(0)}%)</td>
              <td className="px-6 py-2 text-right text-steel-600">{formatCurrency(vatAmount)}</td>
            </tr>
            <tr className="border-t border-steel-200 bg-steel-50/50">
              <td colSpan={4} className="px-6 py-3 text-right text-sm font-bold text-navy-900">Grand Total</td>
              <td className="px-6 py-3 text-right text-lg font-bold text-navy-900">{formatCurrency(grandTotal)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Related */}
      {q.requestId && (
        <div className="mt-4 text-sm text-steel-500">
          <FileText size={14} className="inline mr-1" />
          Linked to request <Link to="/requests" className="text-navy-700 font-medium hover:underline">{q.requestId}</Link>
        </div>
      )}
    </div>
  );
}
