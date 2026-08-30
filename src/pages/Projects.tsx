import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '@/hooks/useAppState';
import { PageHeader, StatusBadge, Button, SearchInput, SelectFilter, ProgressBar, Avatar } from '@/components/ui';
import { Plus, Eye } from 'lucide-react';
import { formatCurrency, formatDateShort } from '@/lib/utils';

export function Projects() {
  const { projects } = useAppState();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const statuses = [...new Set(projects.map(p => p.status))];
  const categories = [...new Set(projects.map(p => p.category))];

  const filtered = projects.filter(p => {
    if (search && !`${p.id} ${p.customer} ${p.project}`.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter && p.status !== statusFilter) return false;
    if (categoryFilter && p.category !== categoryFilter) return false;
    return true;
  });

  return (
    <div>
      <PageHeader
        title="Projects & Jobs"
        subtitle="Active and completed projects"
        actions={<Button><Plus size={15} /> New Project</Button>}
      />

      <div className="flex flex-wrap gap-3 mb-4">
        <SearchInput value={search} onChange={setSearch} placeholder="Search projects..." />
        <SelectFilter value={statusFilter} onChange={setStatusFilter} options={statuses} placeholder="All Statuses" />
        <SelectFilter value={categoryFilter} onChange={setCategoryFilter} options={categories} placeholder="All Categories" />
      </div>

      <div className="bg-white rounded-lg border border-steel-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-steel-100 bg-steel-50/50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-steel-500 uppercase tracking-wider">Project #</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-steel-500 uppercase tracking-wider">Customer</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-steel-500 uppercase tracking-wider">Project</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-steel-500 uppercase tracking-wider">Category</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-steel-500 uppercase tracking-wider">Location</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-steel-500 uppercase tracking-wider">PM</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-steel-500 uppercase tracking-wider">Value</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-steel-500 uppercase tracking-wider w-28">Progress</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-steel-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} className="border-b border-steel-50 hover:bg-steel-50/50 cursor-pointer" onClick={() => navigate(`/projects/${p.id}`)}>
                  <td className="px-4 py-3 font-medium text-navy-900">{p.id}</td>
                  <td className="px-4 py-3 text-navy-800">{p.customer}</td>
                  <td className="px-4 py-3 text-steel-600">{p.project}</td>
                  <td className="px-4 py-3 text-steel-500">{p.category}</td>
                  <td className="px-4 py-3 text-steel-500">{p.location}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Avatar name={p.projectManager} size="sm" />
                      <span className="text-steel-600 text-xs">{p.projectManager.split(' ')[0]}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-navy-900">{formatCurrency(p.value)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <ProgressBar value={p.progress} className="flex-1" />
                      <span className="text-xs text-steel-500 w-8 text-right">{p.progress}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                  <td className="px-4 py-3">
                    <button className="text-steel-400 hover:text-navy-700"><Eye size={15} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 text-xs text-steel-400 border-t border-steel-100">
          Showing {filtered.length} of {projects.length} projects
        </div>
      </div>
    </div>
  );
}
