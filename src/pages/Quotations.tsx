import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '@/hooks/useAppState';
import { PageHeader, StatusBadge, Button, SearchInput, SelectFilter, Avatar, EmptyState } from '@/components/ui';
import { Plus, ChevronRight } from 'lucide-react';
import { formatCurrency, formatDateShort } from '@/lib/utils';

export function Quotations() {
  const { quotations } = useAppState();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const statuses = [...new Set(quotations.map(q => q.status))];
  const filtered = quotations.filter(q => {
    if (search && !`${q.id} ${q.customer} ${q.project}`.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter && q.status !== statusFilter) return false;
    return true;
  });

  return (
    <div>
      <PageHeader
        title="Quotations"
        subtitle="Manage quotations and proposals"
        actions={<Button onClick={() => navigate('/quotations/new')}><Plus size={15} /> Create Quotation</Button>}
      />

      <div className="flex flex-wrap gap-3 mb-4">
        <SearchInput value={search} onChange={setSearch} placeholder="Search quotations..." />
        <SelectFilter value={statusFilter} onChange={setStatusFilter} options={statuses} placeholder="All Statuses" />
      </div>

      <div className="hidden md:block bg-white rounded-lg border border-steel-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-steel-100 bg-steel-50/50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-steel-500 uppercase tracking-wider">Quotation #</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-steel-500 uppercase tracking-wider">Customer</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-steel-500 uppercase tracking-wider">Project</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-steel-500 uppercase tracking-wider">Amount</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-steel-500 uppercase tracking-wider">Created</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-steel-500 uppercase tracking-wider">Valid Until</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-steel-500 uppercase tracking-wider">Owner</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-steel-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(q => (
                <tr key={q.id} className="border-b border-steel-50 hover:bg-steel-50/50 cursor-pointer" onClick={() => navigate(`/quotations/${q.id}`)}>
                  <td className="px-4 py-3 font-medium text-navy-900">{q.id}</td>
                  <td className="px-4 py-3 text-navy-800">{q.customer}</td>
                  <td className="px-4 py-3 text-steel-600">{q.project}</td>
                  <td className="px-4 py-3 text-right font-medium text-navy-900">{formatCurrency(q.amount)}</td>
                  <td className="px-4 py-3 text-steel-500">{formatDateShort(q.created)}</td>
                  <td className="px-4 py-3 text-steel-500">{formatDateShort(q.validUntil)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Avatar name={q.owner} size="sm" />
                      <span className="text-steel-600">{q.owner}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={q.status} /></td>
                  <td className="px-4 py-3"><ChevronRight size={15} className="text-steel-400" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && <EmptyState message="No quotations found." />}
        <div className="px-4 py-3 text-xs text-steel-400 border-t border-steel-100">
          Showing {filtered.length} of {quotations.length} quotations
        </div>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {filtered.length === 0 && <div className="bg-white rounded-lg border border-steel-200"><EmptyState message="No quotations found." /></div>}
        {filtered.map(q => (
          <button key={q.id} onClick={() => navigate(`/quotations/${q.id}`)} className="w-full text-left bg-white rounded-lg border border-steel-200 p-4 active:bg-steel-50">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-steel-500">{q.id}</span>
              <StatusBadge status={q.status} />
            </div>
            <p className="text-sm font-semibold text-navy-900 mt-1">{q.customer}</p>
            <p className="text-sm text-steel-600">{q.project}</p>
            <div className="flex items-center justify-between gap-2 mt-2.5">
              <span className="text-sm font-semibold text-navy-900">{formatCurrency(q.amount)}</span>
              <span className="text-xs text-steel-400">Valid {formatDateShort(q.validUntil)}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
