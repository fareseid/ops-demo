import { useState } from 'react';
import { useAppState } from '@/hooks/useAppState';
import { PageHeader, StatusBadge, KPICard, SearchInput, SelectFilter } from '@/components/ui';
import { formatCurrency } from '@/lib/utils';
import { Package, AlertTriangle, FolderKanban, Truck } from 'lucide-react';

export function Materials() {
  const { inventory } = useAppState();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const categories = [...new Set(inventory.map(i => i.category))];
  const filtered = inventory.filter(i => {
    if (search && !`${i.item} ${i.sku}`.toLowerCase().includes(search.toLowerCase())) return false;
    if (categoryFilter && i.category !== categoryFilter) return false;
    return true;
  });

  const lowStock = inventory.filter(i => i.status === 'Low Stock' || i.status === 'Shortage').length;
  const reserved = inventory.reduce((s, i) => s + i.reserved, 0);

  return (
    <div>
      <PageHeader title="Materials & Inventory" subtitle="Stock levels and material tracking" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPICard label="Total Items" value={inventory.length} icon={<Package size={18} />} />
        <KPICard label="Low Stock / Shortage" value={lowStock} icon={<AlertTriangle size={18} />} />
        <KPICard label="Items Reserved" value={reserved} sub="units across projects" icon={<FolderKanban size={18} />} />
        <KPICard label="Pending Deliveries" value="3" icon={<Truck size={18} />} />
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <SearchInput value={search} onChange={setSearch} placeholder="Search materials..." />
        <SelectFilter value={categoryFilter} onChange={setCategoryFilter} options={categories} placeholder="All Categories" />
      </div>

      <div className="bg-white rounded-lg border border-steel-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-steel-100 bg-steel-50/50">
              <th className="text-left px-4 py-3 text-xs font-semibold text-steel-500 uppercase">Item</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-steel-500 uppercase">Category</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-steel-500 uppercase">SKU</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-steel-500 uppercase">Available</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-steel-500 uppercase">Reserved</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-steel-500 uppercase">Unit</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-steel-500 uppercase">Reorder Level</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-steel-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item, i) => (
              <tr key={i} className="border-b border-steel-50 hover:bg-steel-50/50">
                <td className="px-4 py-3 font-medium text-navy-900">{item.item}</td>
                <td className="px-4 py-3 text-steel-500">{item.category}</td>
                <td className="px-4 py-3 text-steel-400 font-mono text-xs">{item.sku}</td>
                <td className={`px-4 py-3 text-right font-medium ${item.available <= item.reorderLevel ? 'text-red-600' : 'text-navy-900'}`}>{item.available}</td>
                <td className="px-4 py-3 text-right text-steel-500">{item.reserved}</td>
                <td className="px-4 py-3 text-steel-500">{item.unit}</td>
                <td className="px-4 py-3 text-right text-steel-400">{item.reorderLevel}</td>
                <td className="px-4 py-3"><StatusBadge status={item.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-4 py-3 text-xs text-steel-400 border-t border-steel-100">
          {filtered.length} items
        </div>
      </div>
    </div>
  );
}
