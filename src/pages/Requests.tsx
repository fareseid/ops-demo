import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '@/hooks/useAppState';
import { PageHeader, StatusBadge, Button, SearchInput, SelectFilter, Avatar, EmptyState } from '@/components/ui';
import { RequestFormModal } from '@/components/forms';
import { Plus, ChevronRight, MapPin } from 'lucide-react';
import { relativeDate } from '@/lib/utils';

export function Requests() {
  const { requests } = useAppState();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [formOpen, setFormOpen] = useState(false);

  const filtered = requests.filter(r => {
    if (search && !`${r.id} ${r.customer} ${r.service}`.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter && r.status !== statusFilter) return false;
    if (categoryFilter && r.category !== categoryFilter) return false;
    return true;
  });

  const statuses = [...new Set(requests.map(r => r.status))];
  const categories = [...new Set(requests.map(r => r.category))];

  return (
    <div>
      <PageHeader
        title="Requests"
        subtitle="Incoming customer requirements and enquiries"
        actions={<Button onClick={() => setFormOpen(true)}><Plus size={15} /> New Request</Button>}
      />

      <div className="flex flex-wrap gap-3 mb-4">
        <SearchInput value={search} onChange={setSearch} placeholder="Search requests..." />
        <SelectFilter value={statusFilter} onChange={setStatusFilter} options={statuses} placeholder="All Statuses" />
        <SelectFilter value={categoryFilter} onChange={setCategoryFilter} options={categories} placeholder="All Categories" />
      </div>

      {/* Desktop table */}
      <div className="hidden md:block bg-white rounded-lg border border-steel-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-steel-100 bg-steel-50/50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-steel-500 uppercase tracking-wider">Request #</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-steel-500 uppercase tracking-wider">Customer</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-steel-500 uppercase tracking-wider">Service</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-steel-500 uppercase tracking-wider">Location</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-steel-500 uppercase tracking-wider">Received</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-steel-500 uppercase tracking-wider">Assigned To</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-steel-500 uppercase tracking-wider">Priority</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-steel-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.id} className="border-b border-steel-50 hover:bg-steel-50/50 cursor-pointer" onClick={() => navigate(`/requests/${r.id}`)}>
                  <td className="px-4 py-3 font-medium text-navy-900">{r.id}</td>
                  <td className="px-4 py-3 text-navy-800">{r.customer}</td>
                  <td className="px-4 py-3 text-steel-600">{r.service}</td>
                  <td className="px-4 py-3 text-steel-500">{r.location}</td>
                  <td className="px-4 py-3 text-steel-500">{relativeDate(r.received)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Avatar name={r.assignedTo || '—'} size="sm" />
                      <span className="text-steel-600">{r.assignedTo || 'Unassigned'}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={r.priority} /></td>
                  <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                  <td className="px-4 py-3"><ChevronRight size={15} className="text-steel-400" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && <EmptyState message="No requests found." />}
        <div className="px-4 py-3 text-xs text-steel-400 border-t border-steel-100">
          Showing {filtered.length} of {requests.length} requests
        </div>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {filtered.length === 0 && (
          <div className="bg-white rounded-lg border border-steel-200"><EmptyState message="No requests found." /></div>
        )}
        {filtered.map(r => (
          <button
            key={r.id}
            onClick={() => navigate(`/requests/${r.id}`)}
            className="w-full text-left bg-white rounded-lg border border-steel-200 p-4 active:bg-steel-50"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-steel-500">{r.id}</span>
              <StatusBadge status={r.status} />
            </div>
            <p className="text-sm font-semibold text-navy-900 mt-1">{r.customer}</p>
            <p className="text-sm text-steel-600">{r.service}</p>
            <div className="flex items-center justify-between gap-2 mt-2.5">
              <span className="flex items-center gap-1 text-xs text-steel-500"><MapPin size={12} /> {r.location || '—'}</span>
              <StatusBadge status={r.priority} />
            </div>
          </button>
        ))}
      </div>

      <RequestFormModal open={formOpen} onClose={() => setFormOpen(false)} />
    </div>
  );
}
