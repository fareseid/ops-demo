import { useState } from 'react';
import { useAppState } from '@/hooks/useAppState';
import { PageHeader, StatusBadge, Tabs, ProgressBar, Button, EmptyState, ConfirmDialog } from '@/components/ui';
import { EquipmentFormModal, LabourFormModal } from '@/components/forms';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import type { Equipment, LabourResource } from '@/data/mock';

export function Resources() {
  const { equipment, labour, deleteEquipment, deleteLabour, addToast } = useAppState();
  const [tab, setTab] = useState('Equipment');
  const [eqForm, setEqForm] = useState<{ open: boolean; editing?: Equipment }>({ open: false });
  const [lbForm, setLbForm] = useState<{ open: boolean; editing?: LabourResource }>({ open: false });
  const [confirm, setConfirm] = useState<{ type: 'eq' | 'lb'; name: string } | null>(null);

  const doDelete = () => {
    if (!confirm) return;
    if (confirm.type === 'eq') deleteEquipment(confirm.name);
    else deleteLabour(confirm.name);
    addToast(`${confirm.name} removed.`, 'info');
    setConfirm(null);
  };

  return (
    <div>
      <PageHeader
        title="Equipment & Labour"
        subtitle="Resource availability and assignments"
        actions={tab === 'Equipment'
          ? <Button onClick={() => setEqForm({ open: true })}><Plus size={15} /> Add Equipment</Button>
          : <Button onClick={() => setLbForm({ open: true })}><Plus size={15} /> Add Employee / Team</Button>}
      />
      <Tabs tabs={['Equipment', 'Labour']} active={tab} onChange={setTab} />

      <div className="mt-6">
        {tab === 'Equipment' && (
          <>
            <div className="hidden md:block bg-white rounded-lg border border-steel-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-steel-100 bg-steel-50/50">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-steel-500 uppercase">Vehicle / Equipment</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-steel-500 uppercase">Type</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-steel-500 uppercase">Identifier</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-steel-500 uppercase">Availability</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-steel-500 uppercase">Current Assignment</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-steel-500 uppercase">Next Available</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-steel-500 uppercase">Condition</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {equipment.map((e) => (
                    <tr key={e.name} className="border-b border-steel-50 hover:bg-steel-50/50">
                      <td className="px-4 py-3 font-medium text-navy-900">{e.name}</td>
                      <td className="px-4 py-3 text-steel-500">{e.type}</td>
                      <td className="px-4 py-3 text-steel-500">{e.identifier || '—'}</td>
                      <td className="px-4 py-3"><StatusBadge status={e.availability} /></td>
                      <td className="px-4 py-3 text-steel-600">{e.currentAssignment}</td>
                      <td className="px-4 py-3 text-steel-500">{e.nextAvailable}</td>
                      <td className="px-4 py-3"><StatusBadge status={e.condition} /></td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => setEqForm({ open: true, editing: e })} className="text-steel-400 hover:text-navy-700 p-1"><Pencil size={14} /></button>
                          <button onClick={() => setConfirm({ type: 'eq', name: e.name })} className="text-steel-400 hover:text-red-600 p-1"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {equipment.length === 0 && <EmptyState message="No equipment tracked." />}
              <div className="px-4 py-3 text-xs text-steel-400 border-t border-steel-100">{equipment.length} assets tracked</div>
            </div>

            <div className="md:hidden space-y-3">
              {equipment.length === 0 && <div className="bg-white rounded-lg border border-steel-200"><EmptyState message="No equipment tracked." /></div>}
              {equipment.map(e => (
                <div key={e.name} className="bg-white rounded-lg border border-steel-200 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-navy-900">{e.name}</p>
                    <StatusBadge status={e.availability} />
                  </div>
                  <p className="text-xs text-steel-500 mt-0.5">{e.type}{e.identifier ? ` · ${e.identifier}` : ''}</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-steel-500">
                    <span>{e.currentAssignment}</span>
                    <span>Next: {e.nextAvailable}</span>
                    <StatusBadge status={e.condition} />
                  </div>
                  <div className="flex justify-end gap-3 mt-2.5 pt-2 border-t border-steel-50">
                    <button onClick={() => setEqForm({ open: true, editing: e })} className="text-xs text-navy-700 font-medium">Edit</button>
                    <button onClick={() => setConfirm({ type: 'eq', name: e.name })} className="text-xs text-red-600 font-medium">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {tab === 'Labour' && (
          <>
            <div className="hidden md:block bg-white rounded-lg border border-steel-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-steel-100 bg-steel-50/50">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-steel-500 uppercase">Employee / Team</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-steel-500 uppercase">Trade</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-steel-500 uppercase">Current Assignment</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-steel-500 uppercase">Availability</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-steel-500 uppercase w-36">Utilisation</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {labour.map((l) => (
                    <tr key={l.name} className="border-b border-steel-50 hover:bg-steel-50/50">
                      <td className="px-4 py-3 font-medium text-navy-900">{l.name}</td>
                      <td className="px-4 py-3 text-steel-500">{l.trade}</td>
                      <td className="px-4 py-3 text-steel-600">{l.currentAssignment}</td>
                      <td className="px-4 py-3"><StatusBadge status={l.availability} /></td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <ProgressBar value={l.utilisation} className="flex-1" />
                          <span className="text-xs text-steel-500 w-8 text-right">{l.utilisation}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => setLbForm({ open: true, editing: l })} className="text-steel-400 hover:text-navy-700 p-1"><Pencil size={14} /></button>
                          <button onClick={() => setConfirm({ type: 'lb', name: l.name })} className="text-steel-400 hover:text-red-600 p-1"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {labour.length === 0 && <EmptyState message="No resources." />}
              <div className="px-4 py-3 text-xs text-steel-400 border-t border-steel-100">{labour.length} resources</div>
            </div>

            <div className="md:hidden space-y-3">
              {labour.length === 0 && <div className="bg-white rounded-lg border border-steel-200"><EmptyState message="No resources." /></div>}
              {labour.map(l => (
                <div key={l.name} className="bg-white rounded-lg border border-steel-200 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-navy-900">{l.name}</p>
                    <StatusBadge status={l.availability} />
                  </div>
                  <p className="text-xs text-steel-500 mt-0.5">{l.trade}</p>
                  <p className="text-xs text-steel-500 mt-1">{l.currentAssignment}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <ProgressBar value={l.utilisation} className="flex-1" />
                    <span className="text-xs text-steel-500 w-9 text-right">{l.utilisation}%</span>
                  </div>
                  <div className="flex justify-end gap-3 mt-2.5 pt-2 border-t border-steel-50">
                    <button onClick={() => setLbForm({ open: true, editing: l })} className="text-xs text-navy-700 font-medium">Edit</button>
                    <button onClick={() => setConfirm({ type: 'lb', name: l.name })} className="text-xs text-red-600 font-medium">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {eqForm.open && <EquipmentFormModal open onClose={() => setEqForm({ open: false })} editing={eqForm.editing} />}
      {lbForm.open && <LabourFormModal open onClose={() => setLbForm({ open: false })} editing={lbForm.editing} />}
      <ConfirmDialog
        open={!!confirm}
        title="Remove this resource?"
        message={`Are you sure you want to remove ${confirm?.name}?`}
        confirmLabel="Remove"
        onConfirm={doDelete}
        onCancel={() => setConfirm(null)}
      />
    </div>
  );
}
