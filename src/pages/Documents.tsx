import { useState } from 'react';
import { useAppState } from '@/hooks/useAppState';
import { PageHeader, SearchInput, SelectFilter, Button, EmptyState, ConfirmDialog } from '@/components/ui';
import { DocumentFormModal } from '@/components/forms';
import { FileText, Download, Plus, Trash2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export function Documents() {
  const { documents, deleteDocument, addToast } = useAppState();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [projectFilter, setProjectFilter] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [confirmName, setConfirmName] = useState<string | null>(null);

  const types = [...new Set(documents.map(d => d.type))];
  const docProjects = [...new Set(documents.map(d => d.project))];

  const filtered = documents.filter(d => {
    if (search && !d.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (typeFilter && d.type !== typeFilter) return false;
    if (projectFilter && d.project !== projectFilter) return false;
    return true;
  });

  const doDelete = () => {
    if (confirmName) { deleteDocument(confirmName); addToast('Document removed.', 'info'); setConfirmName(null); }
  };

  return (
    <div>
      <PageHeader
        title="Documents"
        subtitle="Project files, drawings, quotations and safety documents"
        actions={<Button onClick={() => setFormOpen(true)}><Plus size={15} /> Add Document</Button>}
      />

      <div className="flex flex-wrap gap-3 mb-4">
        <SearchInput value={search} onChange={setSearch} placeholder="Search documents..." />
        <SelectFilter value={typeFilter} onChange={setTypeFilter} options={types} placeholder="All Types" />
        <SelectFilter value={projectFilter} onChange={setProjectFilter} options={docProjects} placeholder="All Projects" />
      </div>

      <div className="bg-white rounded-lg border border-steel-200">
        {filtered.length === 0 ? (
          <EmptyState message="No documents found." />
        ) : (
          filtered.map((d, i) => (
            <div key={i} className="flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3.5 border-b border-steel-50 last:border-0 hover:bg-steel-50/50">
              <FileText size={18} className="text-steel-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-navy-900 truncate">{d.name}</p>
                <p className="text-xs text-steel-400 mt-0.5 truncate">{d.type} · {d.project}{d.description ? ` · ${d.description}` : ''}</p>
              </div>
              <span className="text-xs text-steel-400 hidden sm:block">{formatDate(d.date)}</span>
              <span className="text-xs text-steel-400 hidden sm:block w-16 text-right">{d.size}</span>
              <button onClick={() => addToast('Download started.', 'info')} className="text-steel-400 hover:text-navy-700 p-1"><Download size={15} /></button>
              <button onClick={() => setConfirmName(d.name)} className="text-steel-400 hover:text-red-600 p-1"><Trash2 size={15} /></button>
            </div>
          ))
        )}
        <div className="px-4 py-3 text-xs text-steel-400 border-t border-steel-100">{filtered.length} documents</div>
      </div>

      {formOpen && <DocumentFormModal open onClose={() => setFormOpen(false)} />}
      <ConfirmDialog
        open={!!confirmName}
        title="Remove this document?"
        message={`Are you sure you want to remove "${confirmName}"?`}
        confirmLabel="Remove"
        onConfirm={doDelete}
        onCancel={() => setConfirmName(null)}
      />
    </div>
  );
}
