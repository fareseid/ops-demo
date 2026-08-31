import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAppState } from '@/hooks/useAppState';
import { StatusBadge, Button, ConfirmDialog } from '@/components/ui';
import { RequestFormModal } from '@/components/forms';
import { formatDate } from '@/lib/utils';
import { Mail, Phone, MapPin, User, Calendar, FileText, Pencil, Trash2, Receipt, ArrowRight } from 'lucide-react';

export function RequestDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { requests, quotations, deleteRequest, addToast } = useAppState();
  const [editOpen, setEditOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const r = requests.find(x => x.id === id);

  if (!r) return <div className="p-8 text-steel-500">Request not found. <Link to="/requests" className="text-navy-700 hover:underline">Back to Requests</Link></div>;

  const linkedQuote = quotations.find(q => q.requestId === r.id);

  const handleDelete = () => {
    deleteRequest(r.id);
    addToast(`Request ${r.id} deleted.`, 'info');
    navigate('/requests');
  };

  return (
    <div>
      <div className="flex items-center gap-2 text-sm text-steel-500 mb-4">
        <Link to="/requests" className="hover:text-navy-700">Requests</Link>
        <span>/</span>
        <span className="text-navy-900 font-medium">{r.id}</span>
      </div>

      <div className="bg-white rounded-lg border border-steel-200 p-4 sm:p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-lg sm:text-xl font-semibold text-navy-900">{r.customer}</h1>
              <StatusBadge status={r.status} />
              <StatusBadge status={r.priority} />
            </div>
            <p className="text-sm text-steel-600 mt-1">{r.service}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" onClick={() => setEditOpen(true)}><Pencil size={14} /> Edit</Button>
            <Button variant="secondary" size="sm" onClick={() => setConfirmOpen(true)}><Trash2 size={14} /> Delete</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6 pt-5 border-t border-steel-100 text-sm">
          <div className="flex items-center gap-2 text-steel-600"><User size={14} className="text-steel-400" /> {r.contactPerson || '—'}</div>
          <div className="flex items-center gap-2 text-steel-600 min-w-0"><Mail size={14} className="text-steel-400 flex-shrink-0" /> <span className="truncate">{r.email || '—'}</span></div>
          <div className="flex items-center gap-2 text-steel-600"><Phone size={14} className="text-steel-400" /> {r.phone || '—'}</div>
          <div className="flex items-center gap-2 text-steel-600"><MapPin size={14} className="text-steel-400" /> {r.location || '—'}</div>
          <div className="flex items-center gap-2 text-steel-600"><Calendar size={14} className="text-steel-400" /> {formatDate(r.received)}</div>
          <div className="flex items-center gap-2 text-steel-600"><FileText size={14} className="text-steel-400" /> {r.category}</div>
        </div>
      </div>

      {/* Quotation linkage / CTA */}
      {linkedQuote ? (
        <div className="bg-steel-50 border border-steel-200 rounded-lg p-4 mb-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Receipt className="text-navy-600 flex-shrink-0" size={20} />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-navy-900">Quotation {linkedQuote.id}</p>
              <p className="text-xs text-steel-500">This request has been quoted — status {linkedQuote.status}.</p>
            </div>
          </div>
          <Button size="sm" onClick={() => navigate(`/quotations/${linkedQuote.id}`)}>View <ArrowRight size={14} /></Button>
        </div>
      ) : (
        <div className="bg-white border border-steel-200 rounded-lg p-4 mb-6 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-navy-900">Ready to quote?</p>
            <p className="text-xs text-steel-500">Create a quotation prefilled from this request.</p>
          </div>
          <Button size="sm" onClick={() => navigate(`/quotations/new?requestId=${r.id}`)}>
            <FileText size={14} /> Create Quotation
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        <Section title="Description" body={r.description} />
        <Section title="Requirements" body={r.requirements} />
        <Section title="Internal Notes" body={r.notes} italic />
      </div>

      <RequestFormModal open={editOpen} onClose={() => setEditOpen(false)} editing={r} />
      <ConfirmDialog
        open={confirmOpen}
        title="Delete this request?"
        message={`Are you sure you want to delete ${r.id}? This cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}

function Section({ title, body, italic }: { title: string; body: string; italic?: boolean }) {
  return (
    <div className="bg-white rounded-lg border border-steel-200 p-5">
      <p className="text-xs font-semibold text-steel-500 uppercase mb-1.5">{title}</p>
      <p className={`text-sm text-navy-800 leading-relaxed ${italic ? 'italic text-steel-600' : ''}`}>{body || '—'}</p>
    </div>
  );
}
