import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '@/hooks/useAppState';
import { PageHeader, StatusBadge, Button, SearchInput, SelectFilter, Modal, Avatar } from '@/components/ui';
import { Plus, Eye, FileText, Phone, Mail, MapPin } from 'lucide-react';
import { formatDate, relativeDate } from '@/lib/utils';
import type { CustomerRequest } from '@/data/mock';

export function Requests() {
  const { requests } = useAppState();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [selectedReq, setSelectedReq] = useState<CustomerRequest | null>(null);

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
        actions={<Button onClick={() => {}}><Plus size={15} /> New Request</Button>}
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <SearchInput value={search} onChange={setSearch} placeholder="Search requests..." />
        <SelectFilter value={statusFilter} onChange={setStatusFilter} options={statuses} placeholder="All Statuses" />
        <SelectFilter value={categoryFilter} onChange={setCategoryFilter} options={categories} placeholder="All Categories" />
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-steel-200 overflow-hidden">
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
                <tr key={r.id} className="border-b border-steel-50 hover:bg-steel-50/50 cursor-pointer" onClick={() => setSelectedReq(r)}>
                  <td className="px-4 py-3 font-medium text-navy-900">{r.id}</td>
                  <td className="px-4 py-3 text-navy-800">{r.customer}</td>
                  <td className="px-4 py-3 text-steel-600">{r.service}</td>
                  <td className="px-4 py-3 text-steel-500">{r.location}</td>
                  <td className="px-4 py-3 text-steel-500">{relativeDate(r.received)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Avatar name={r.assignedTo} size="sm" />
                      <span className="text-steel-600">{r.assignedTo}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={r.priority} /></td>
                  <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                  <td className="px-4 py-3">
                    <button className="text-steel-400 hover:text-navy-700"><Eye size={15} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 text-xs text-steel-400 border-t border-steel-100">
          Showing {filtered.length} of {requests.length} requests
        </div>
      </div>

      {/* Detail Drawer */}
      <Modal open={!!selectedReq} onClose={() => setSelectedReq(null)} title={selectedReq?.id || ''} width="max-w-2xl">
        {selectedReq && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-navy-900">{selectedReq.customer}</h3>
                <p className="text-sm text-steel-500">{selectedReq.service}</p>
              </div>
              <div className="flex gap-2">
                <StatusBadge status={selectedReq.priority} />
                <StatusBadge status={selectedReq.status} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2 text-steel-600"><Mail size={14} /> {selectedReq.email}</div>
              <div className="flex items-center gap-2 text-steel-600"><Phone size={14} /> {selectedReq.phone}</div>
              <div className="flex items-center gap-2 text-steel-600"><MapPin size={14} /> {selectedReq.location}</div>
              <div className="text-steel-600">Contact: {selectedReq.contactPerson}</div>
            </div>

            <div>
              <p className="text-xs font-semibold text-steel-500 uppercase mb-1">Description</p>
              <p className="text-sm text-navy-800">{selectedReq.description}</p>
            </div>

            <div>
              <p className="text-xs font-semibold text-steel-500 uppercase mb-1">Requirements</p>
              <p className="text-sm text-navy-800">{selectedReq.requirements}</p>
            </div>

            <div>
              <p className="text-xs font-semibold text-steel-500 uppercase mb-1">Internal Notes</p>
              <p className="text-sm text-steel-600 italic">{selectedReq.notes}</p>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-steel-100">
              <Button variant="secondary" onClick={() => setSelectedReq(null)}>Close</Button>
              <Button onClick={() => { setSelectedReq(null); navigate('/quotations'); }}>
                <FileText size={14} /> Create Quotation
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
