import { useState } from 'react';
import { PageHeader, SearchInput, SelectFilter } from '@/components/ui';
import { documents } from '@/data/mock';
import { FileText, Download } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export function Documents() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [projectFilter, setProjectFilter] = useState('');

  const types = [...new Set(documents.map(d => d.type))];
  const docProjects = [...new Set(documents.map(d => d.project))];

  const filtered = documents.filter(d => {
    if (search && !d.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (typeFilter && d.type !== typeFilter) return false;
    if (projectFilter && d.project !== projectFilter) return false;
    return true;
  });

  return (
    <div>
      <PageHeader title="Documents" subtitle="Project files, drawings, quotations and safety documents" />

      <div className="flex flex-wrap gap-3 mb-4">
        <SearchInput value={search} onChange={setSearch} placeholder="Search documents..." />
        <SelectFilter value={typeFilter} onChange={setTypeFilter} options={types} placeholder="All Types" />
        <SelectFilter value={projectFilter} onChange={setProjectFilter} options={docProjects} placeholder="All Projects" />
      </div>

      <div className="bg-white rounded-lg border border-steel-200">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-steel-400 text-sm">No documents found.</div>
        ) : (
          filtered.map((d, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-3.5 border-b border-steel-50 last:border-0 hover:bg-steel-50/50 cursor-pointer">
              <FileText size={18} className="text-steel-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-navy-900 truncate">{d.name}</p>
                <p className="text-xs text-steel-400 mt-0.5">{d.type} · {d.project}</p>
              </div>
              <span className="text-xs text-steel-400">{formatDate(d.date)}</span>
              <span className="text-xs text-steel-400">{d.size}</span>
              <button className="text-steel-400 hover:text-navy-700"><Download size={15} /></button>
            </div>
          ))
        )}
        <div className="px-4 py-3 text-xs text-steel-400 border-t border-steel-100">
          {filtered.length} documents
        </div>
      </div>
    </div>
  );
}
