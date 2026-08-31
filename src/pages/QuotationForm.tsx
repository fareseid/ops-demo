import { useState } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAppState, type NewQuotationInput } from '@/hooks/useAppState';
import { Button, FormField, Input, Textarea, FormSelect } from '@/components/ui';
import { OWNERS, PAYMENT_TERMS, UNITS } from '@/data/options';
import { formatCurrency, TODAY } from '@/lib/utils';
import type { QuotationLineItem } from '@/data/mock';
import { Plus, Trash2, ArrowLeft } from 'lucide-react';

function addDays(iso: string, days: number): string {
  const d = new Date(iso || TODAY);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

const emptyLine = (): QuotationLineItem => ({ description: '', qty: 1, unit: 'unit', unitPrice: 0, total: 0 });

export function QuotationForm() {
  const { id } = useParams<{ id: string }>();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { quotations, requests, addQuotation, updateQuotation, addToast } = useAppState();

  const editing = id ? quotations.find(q => q.id === id) : undefined;
  const requestId = params.get('requestId') || editing?.requestId || '';
  const sourceReq = requests.find(r => r.id === requestId);

  const [f, setF] = useState({
    requestId,
    customer: editing?.customer || sourceReq?.customer || '',
    project: editing?.project || sourceReq?.service || '',
    contactPerson: editing?.contactPerson || sourceReq?.contactPerson || '',
    owner: editing?.owner || 'Tsindikai',
    created: editing?.created || TODAY,
    validUntil: editing?.validUntil || addDays(TODAY, 14),
    paymentTerms: editing?.paymentTerms || '30 days from invoice',
    deliveryTimeframe: editing?.deliveryTimeframe || '',
    vatPct: editing ? Math.round(editing.vat * 100) : 16,
    notes: editing?.notes || '',
  });
  const [lines, setLines] = useState<QuotationLineItem[]>(editing?.lineItems?.length ? editing.lineItems.map(l => ({ ...l })) : [emptyLine()]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const set = (k: keyof typeof f, v: string | number) => setF(p => ({ ...p, [k]: v }));

  const updateLine = (i: number, patch: Partial<QuotationLineItem>) => {
    setLines(ls => ls.map((l, idx) => {
      if (idx !== i) return l;
      const merged = { ...l, ...patch };
      merged.total = Math.round((Number(merged.qty) || 0) * (Number(merged.unitPrice) || 0));
      return merged;
    }));
  };
  const addLine = () => setLines(ls => [...ls, emptyLine()]);
  const removeLine = (i: number) => setLines(ls => ls.length > 1 ? ls.filter((_, idx) => idx !== i) : ls);

  const subtotal = lines.reduce((s, l) => s + l.total, 0);
  const vatAmount = Math.round(subtotal * (f.vatPct / 100));
  const grandTotal = subtotal + vatAmount;

  const validate = () => {
    const e: Record<string, string> = {};
    if (!f.customer.trim()) e.customer = 'Customer is required';
    if (!f.project.trim()) e.project = 'Project title is required';
    if (!lines.some(l => l.description.trim() && l.total > 0)) e.lines = 'Add at least one line item with a description and amount';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = () => {
    if (!validate()) { addToast('Please fix the highlighted fields.', 'error'); return; }
    setSaving(true);
    const cleanLines = lines.filter(l => l.description.trim());
    const input: NewQuotationInput = {
      requestId: f.requestId || undefined,
      customer: f.customer, project: f.project, contactPerson: f.contactPerson,
      owner: f.owner, created: f.created, validUntil: f.validUntil,
      paymentTerms: f.paymentTerms, deliveryTimeframe: f.deliveryTimeframe,
      lineItems: cleanLines, vat: f.vatPct / 100, notes: f.notes,
    };
    setTimeout(() => {
      if (editing) {
        updateQuotation(editing.id, input);
        addToast(`Quotation ${editing.id} updated.`);
        navigate(`/quotations/${editing.id}`);
      } else {
        const newId = addQuotation(input);
        addToast(`Quotation ${newId} created${f.requestId ? ` — request ${f.requestId} marked Quoted` : ''}.`);
        navigate(`/quotations/${newId}`);
      }
      setSaving(false);
    }, 500);
  };

  return (
    <div className="pb-24 sm:pb-0">
      <div className="flex items-center gap-2 text-sm text-steel-500 mb-4">
        <Link to="/quotations" className="hover:text-navy-700 flex items-center gap-1"><ArrowLeft size={14} /> Quotations</Link>
        <span>/</span>
        <span className="text-navy-900 font-medium">{editing ? `Edit ${editing.id}` : 'New Quotation'}</span>
      </div>

      <h1 className="text-lg sm:text-xl font-semibold text-navy-900 mb-1">{editing ? `Edit Quotation ${editing.id}` : 'Create Quotation'}</h1>
      <p className="text-sm text-steel-500 mb-6">{sourceReq ? `Prefilled from request ${sourceReq.id}` : 'Build a quotation with dynamic line items'}</p>

      {/* Details */}
      <div className="bg-white rounded-lg border border-steel-200 p-4 sm:p-6 mb-6">
        <h3 className="text-sm font-semibold text-navy-900 mb-4">Quotation Details</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <FormField label="Customer" required error={errors.customer}>
            <Input value={f.customer} onChange={e => set('customer', e.target.value)} placeholder="Customer name" invalid={!!errors.customer} />
          </FormField>
          <FormField label="Related Request">
            <FormSelect value={f.requestId} onChange={v => set('requestId', v)} options={[{ value: '', label: 'None' }, ...requests.map(r => ({ value: r.id, label: `${r.id} — ${r.customer}` }))]} />
          </FormField>
          <FormField label="Project / Requirement Title" required error={errors.project}>
            <Input value={f.project} onChange={e => set('project', e.target.value)} placeholder="e.g. Electrical Panel Upgrade" invalid={!!errors.project} />
          </FormField>
          <FormField label="Customer Contact">
            <Input value={f.contactPerson} onChange={e => set('contactPerson', e.target.value)} placeholder="Contact person" />
          </FormField>
          <FormField label="Prepared By">
            <FormSelect value={f.owner} onChange={v => set('owner', v)} options={OWNERS} />
          </FormField>
          <FormField label="Creation Date">
            <Input type="date" value={f.created} onChange={e => set('created', e.target.value)} />
          </FormField>
          <FormField label="Valid Until">
            <Input type="date" value={f.validUntil} onChange={e => set('validUntil', e.target.value)} />
          </FormField>
          <FormField label="Payment Terms">
            <FormSelect value={f.paymentTerms} onChange={v => set('paymentTerms', v)} options={PAYMENT_TERMS} />
          </FormField>
          <FormField label="Delivery Timeframe">
            <Input value={f.deliveryTimeframe} onChange={e => set('deliveryTimeframe', e.target.value)} placeholder="e.g. 14 working days" />
          </FormField>
        </div>
        <FormField label="Notes" className="mt-4">
          <Textarea value={f.notes} onChange={e => set('notes', e.target.value)} placeholder="Additional notes or terms…" rows={2} />
        </FormField>
      </div>

      {/* Line items */}
      <div className="bg-white rounded-lg border border-steel-200 p-4 sm:p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-navy-900">Line Items</h3>
          <Button variant="secondary" size="sm" onClick={addLine}><Plus size={14} /> Add Line</Button>
        </div>
        {errors.lines && <p className="text-xs text-red-600 mb-3">{errors.lines}</p>}

        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-semibold text-steel-500 uppercase">
                <th className="pb-2 pr-3 font-semibold">Description</th>
                <th className="pb-2 px-2 w-20 text-right">Qty</th>
                <th className="pb-2 px-2 w-28">Unit</th>
                <th className="pb-2 px-2 w-32 text-right">Unit Price</th>
                <th className="pb-2 px-2 w-32 text-right">Total</th>
                <th className="pb-2 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {lines.map((l, i) => (
                <tr key={i} className="align-top">
                  <td className="py-1.5 pr-3"><Input value={l.description} onChange={e => updateLine(i, { description: e.target.value })} placeholder="Item description" /></td>
                  <td className="py-1.5 px-2"><Input type="number" min="0" value={l.qty} onChange={e => updateLine(i, { qty: parseFloat(e.target.value) || 0 })} className="text-right" /></td>
                  <td className="py-1.5 px-2"><FormSelect value={l.unit} onChange={v => updateLine(i, { unit: v })} options={UNITS} /></td>
                  <td className="py-1.5 px-2"><Input type="number" min="0" value={l.unitPrice} onChange={e => updateLine(i, { unitPrice: parseFloat(e.target.value) || 0 })} className="text-right" /></td>
                  <td className="py-1.5 px-2 text-right font-medium text-navy-900 whitespace-nowrap pt-4">{formatCurrency(l.total)}</td>
                  <td className="py-1.5 pt-3 text-center">
                    <button onClick={() => removeLine(i)} className="text-steel-400 hover:text-red-600 disabled:opacity-30" disabled={lines.length === 1}><Trash2 size={15} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden space-y-3">
          {lines.map((l, i) => (
            <div key={i} className="border border-steel-200 rounded-lg p-3 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-steel-500">Item {i + 1}</span>
                <button onClick={() => removeLine(i)} className="text-steel-400 hover:text-red-600 disabled:opacity-30" disabled={lines.length === 1}><Trash2 size={15} /></button>
              </div>
              <FormField label="Description"><Input value={l.description} onChange={e => updateLine(i, { description: e.target.value })} placeholder="Item description" /></FormField>
              <div className="grid grid-cols-2 gap-2">
                <FormField label="Quantity"><Input type="number" min="0" value={l.qty} onChange={e => updateLine(i, { qty: parseFloat(e.target.value) || 0 })} /></FormField>
                <FormField label="Unit"><FormSelect value={l.unit} onChange={v => updateLine(i, { unit: v })} options={UNITS} /></FormField>
              </div>
              <FormField label="Unit Price (ZMW)"><Input type="number" min="0" value={l.unitPrice} onChange={e => updateLine(i, { unitPrice: parseFloat(e.target.value) || 0 })} /></FormField>
              <div className="flex items-center justify-between pt-1 border-t border-steel-100">
                <span className="text-xs text-steel-500">Total</span>
                <span className="text-sm font-semibold text-navy-900">{formatCurrency(l.total)}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="mt-5 pt-4 border-t border-steel-200 flex justify-end">
          <div className="w-full sm:w-72 space-y-2">
            <div className="flex justify-between text-sm"><span className="text-steel-500">Subtotal</span><span className="font-medium text-navy-900">{formatCurrency(subtotal)}</span></div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-steel-500 flex items-center gap-2">VAT
                <input type="number" min="0" max="100" value={f.vatPct} onChange={e => set('vatPct', parseFloat(e.target.value) || 0)} className="w-14 px-2 py-1 text-xs border border-steel-200 rounded text-right" />%
              </span>
              <span className="text-steel-600">{formatCurrency(vatAmount)}</span>
            </div>
            <div className="flex justify-between text-base pt-2 border-t border-steel-200"><span className="font-bold text-navy-900">Grand Total</span><span className="font-bold text-navy-900">{formatCurrency(grandTotal)}</span></div>
          </div>
        </div>
      </div>

      {/* Desktop actions */}
      <div className="hidden sm:flex justify-end gap-2">
        <Button variant="secondary" onClick={() => navigate(editing ? `/quotations/${editing.id}` : '/quotations')} disabled={saving}>Cancel</Button>
        <Button onClick={submit} disabled={saving}>{saving ? 'Saving…' : editing ? 'Save Changes' : 'Save Quotation'}</Button>
      </div>

      {/* Mobile sticky bottom action bar */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-steel-200 p-3 flex gap-2 z-20">
        <Button variant="secondary" className="flex-1 justify-center" onClick={() => navigate(editing ? `/quotations/${editing.id}` : '/quotations')} disabled={saving}>Cancel</Button>
        <Button className="flex-1 justify-center" onClick={submit} disabled={saving}>{saving ? 'Saving…' : editing ? 'Save' : 'Save Quotation'}</Button>
      </div>
    </div>
  );
}
