import { useState } from 'react';
import { useAppState } from '@/hooks/useAppState';
import { PageHeader, StatusBadge, KPICard, SearchInput, SelectFilter, Button, EmptyState, ConfirmDialog } from '@/components/ui';
import { InventoryFormModal } from '@/components/forms';
import { Package, AlertTriangle, FolderKanban, Truck, Plus, Pencil, Trash2 } from 'lucide-react';
import type { InventoryItem } from '@/data/mock';

export function Materials() {
  const { inventory, deleteInventory, addToast } = useAppState();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [form, setForm] = useState<{ open: boolean; editing?: InventoryItem }>({ open: false });
  const [confirmSku, setConfirmSku] = useState<string | null>(null);

  const categories = [...new Set(inventory.map(i => i.category))];
  const filtered = inventory.filter(i => {
    if (search && !`${i.item} ${i.sku}`.toLowerCase().includes(search.toLowerCase())) return false;
    if (categoryFilter && i.category !== categoryFilter) return false;
    return true;
  });

  const lowStock = inventory.filter(i => i.status === 'Low Stock' || i.status === 'Shortage' || i.status === 'Out of Stock').length;
  const reserved = inventory.reduce((s, i) => s + i.reserved, 0);

  const confirmItem = inventory.find(i => i.sku === confirmSku);
  const doDelete = () => {
    if (confirmSku) { deleteInventory(confirmSku); addToast('Material removed.', 'info'); setConfirmSku(null); }
  };

  return (
    <div>
      <PageHeader
        title="Materials & Inventory"
        subtitle="Stock levels and material tracking"
        actions={<Button onClick={() => setForm({ open: true })}><Plus size={15} /> Add Material</Button>}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <KPICard label="Total Items" value={inventory.length} icon={<Package size={18} />} />
        <KPICard label="Low / Out of Stock" value={lowStock} icon={<AlertTriangle size={18} />} />
        <KPICard label="Items Reserved" value={reserved} sub="units across projects" icon={<FolderKanban size={18} />} />
        <KPICard label="Categories" value={categories.length} icon={<Truck size={18} />} />
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <SearchInput value={search} onChange={setSearch} placeholder="Search materials..." />
        <SelectFilter value={categoryFilter} onChange={setCategoryFilter} options={categories} placeholder="All Categories" />
      </div>

      {/* Desktop table */}
      <div className="hidden md:block bg-white rounded-lg border border-steel-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-steel-100 bg-steel-50/50">
              <th className="text-left px-4 py-3 text-xs font-semibold text-steel-500 uppercase">Item</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-steel-500 uppercase">Category</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-steel-500 uppercase">SKU</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-steel-500 uppercase">Available</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-steel-500 uppercase">Reserved</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-steel-500 uppercase">Reorder</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-steel-500 uppercase">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => (
              <tr key={item.sku} className="border-b border-steel-50 hover:bg-steel-50/50">
                <td className="px-4 py-3 font-medium text-navy-900">{item.item}</td>
                <td className="px-4 py-3 text-steel-500">{item.category}</td>
                <td className="px-4 py-3 text-steel-400 font-mono text-xs">{item.sku}</td>
                <td className={`px-4 py-3 text-right font-medium ${item.available <= item.reorderLevel ? 'text-red-600' : 'text-navy-900'}`}>{item.available} {item.unit}</td>
                <td className="px-4 py-3 text-right text-steel-500">{item.reserved}</td>
                <td className="px-4 py-3 text-right text-steel-400">{item.reorderLevel}</td>
                <td className="px-4 py-3"><StatusBadge status={item.status} /></td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => setForm({ open: true, editing: item })} className="text-steel-400 hover:text-navy-700 p-1"><Pencil size={14} /></button>
                    <button onClick={() => setConfirmSku(item.sku)} className="text-steel-400 hover:text-red-600 p-1"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <EmptyState message="No materials found." />}
        <div className="px-4 py-3 text-xs text-steel-400 border-t border-steel-100">{filtered.length} items</div>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {filtered.length === 0 && <div className="bg-white rounded-lg border border-steel-200"><EmptyState message="No materials found." /></div>}
        {filtered.map(item => (
          <div key={item.sku} className="bg-white rounded-lg border border-steel-200 p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-navy-900">{item.item}</p>
              <StatusBadge status={item.status} />
            </div>
            <p className="text-xs text-steel-400 font-mono mt-0.5">{item.sku} · {item.category}</p>
            <div className="flex gap-4 mt-2 text-xs text-steel-500">
              <span>Avail: <b className={item.available <= item.reorderLevel ? 'text-red-600' : 'text-navy-800'}>{item.available} {item.unit}</b></span>
              <span>Reserved: <b className="text-navy-800">{item.reserved}</b></span>
              <span>Reorder: <b className="text-navy-800">{item.reorderLevel}</b></span>
            </div>
            <div className="flex justify-end gap-3 mt-2.5 pt-2 border-t border-steel-50">
              <button onClick={() => setForm({ open: true, editing: item })} className="text-xs text-navy-700 font-medium">Edit</button>
              <button onClick={() => setConfirmSku(item.sku)} className="text-xs text-red-600 font-medium">Delete</button>
            </div>
          </div>
        ))}
      </div>

      {form.open && <InventoryFormModal open onClose={() => setForm({ open: false })} editing={form.editing} />}
      <ConfirmDialog
        open={!!confirmSku}
        title="Remove this material?"
        message={`Are you sure you want to remove ${confirmItem?.item || 'this item'} from inventory?`}
        confirmLabel="Remove"
        onConfirm={doDelete}
        onCancel={() => setConfirmSku(null)}
      />
    </div>
  );
}
