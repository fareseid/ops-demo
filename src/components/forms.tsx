import { useState } from 'react';
import { Modal, Button, FormField, Input, Textarea, FormSelect, FormActions } from './ui';
import { useAppState, type NewRequestInput } from '@/hooks/useAppState';
import { CATEGORIES, PRIORITIES, STAFF, UNITS, SUPPLIERS, PROJECT_TASK_STATUSES, EQUIPMENT_TYPES, EQUIPMENT_CONDITION, EQUIPMENT_AVAILABILITY, LABOUR_AVAILABILITY, DOCUMENT_TYPES } from '@/data/options';
import { TODAY, formatCurrency } from '@/lib/utils';
import { Plus, Trash2 } from 'lucide-react';
import type { CustomerRequest, ProjectTask, ProjectMaterial, InventoryItem, Equipment, LabourResource, Invoice } from '@/data/mock';

function useSaving() {
  const [saving, setSaving] = useState(false);
  const run = (fn: () => void) => {
    setSaving(true);
    setTimeout(() => { fn(); setSaving(false); }, 500);
  };
  return { saving, run };
}

function addDaysISO(iso: string, days: number): string {
  const d = new Date(iso || TODAY);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

const emailOk = (e: string) => !e || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

// ---------- REQUEST FORM ----------
export function RequestFormModal({ open, onClose, editing }: {
  open: boolean; onClose: () => void; editing?: CustomerRequest;
}) {
  const { addRequest, updateRequest, addToast } = useAppState();
  const { saving, run } = useSaving();
  const [f, setF] = useState<NewRequestInput>(() => ({
    customer: editing?.customer || '',
    contactPerson: editing?.contactPerson || '',
    phone: editing?.phone || '',
    email: editing?.email || '',
    service: editing?.service || '',
    category: editing?.category || '',
    location: editing?.location || '',
    description: editing?.description || '',
    requirements: editing?.requirements || '',
    priority: editing?.priority || 'Normal',
    assignedTo: editing?.assignedTo || '',
    received: editing?.received || TODAY,
    notes: editing?.notes || '',
  }));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const set = (k: keyof NewRequestInput, v: string) => setF(p => ({ ...p, [k]: v }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!f.customer.trim()) e.customer = 'Customer is required';
    if (!f.service.trim()) e.service = 'Service is required';
    if (!f.category) e.category = 'Select a category';
    if (!emailOk(f.email)) e.email = 'Enter a valid email address';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = () => {
    if (!validate()) return;
    run(() => {
      if (editing) {
        updateRequest(editing.id, { ...f });
        addToast(`Request ${editing.id} updated.`);
      } else {
        const id = addRequest(f);
        addToast(`Request ${id} created.`);
      }
      onClose();
    });
  };

  return (
    <Modal open={open} onClose={onClose} title={editing ? `Edit ${editing.id}` : 'New Request'} width="max-w-2xl">
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Customer" required error={errors.customer}>
            <Input value={f.customer} onChange={e => set('customer', e.target.value)} placeholder="e.g. Copperbelt Mining Services" invalid={!!errors.customer} />
          </FormField>
          <FormField label="Contact Person">
            <Input value={f.contactPerson} onChange={e => set('contactPerson', e.target.value)} placeholder="Full name" />
          </FormField>
          <FormField label="Phone">
            <Input value={f.phone} onChange={e => set('phone', e.target.value)} placeholder="+260 …" />
          </FormField>
          <FormField label="Email" error={errors.email}>
            <Input type="email" value={f.email} onChange={e => set('email', e.target.value)} placeholder="name@company.co.zm" invalid={!!errors.email} />
          </FormField>
          <FormField label="Service / Requirement" required error={errors.service}>
            <Input value={f.service} onChange={e => set('service', e.target.value)} placeholder="e.g. Electrical Panel Upgrade" invalid={!!errors.service} />
          </FormField>
          <FormField label="Category" required error={errors.category}>
            <FormSelect value={f.category} onChange={v => set('category', v)} options={CATEGORIES} placeholder="Select category" invalid={!!errors.category} />
          </FormField>
          <FormField label="Site Location">
            <Input value={f.location} onChange={e => set('location', e.target.value)} placeholder="e.g. Kitwe" />
          </FormField>
          <FormField label="Priority" required>
            <FormSelect value={f.priority} onChange={v => set('priority', v)} options={[...PRIORITIES]} />
          </FormField>
          <FormField label="Assigned To">
            <FormSelect value={f.assignedTo} onChange={v => set('assignedTo', v)} options={STAFF} placeholder="Unassigned" />
          </FormField>
          <FormField label="Date Received">
            <Input type="date" value={f.received} onChange={e => set('received', e.target.value)} />
          </FormField>
        </div>
        <FormField label="Description">
          <Textarea value={f.description} onChange={e => set('description', e.target.value)} placeholder="Describe the customer's requirement…" rows={3} />
        </FormField>
        <FormField label="Requirements / Scope">
          <Textarea value={f.requirements} onChange={e => set('requirements', e.target.value)} placeholder="Technical requirements, quantities, standards…" rows={2} />
        </FormField>
        <FormField label="Internal Notes">
          <Textarea value={f.notes} onChange={e => set('notes', e.target.value)} placeholder="Notes for the team…" rows={2} />
        </FormField>
        <FormActions>
          <Button variant="secondary" size="sm" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button size="sm" onClick={submit} disabled={saving}>{saving ? 'Saving…' : editing ? 'Save Changes' : 'Create Request'}</Button>
        </FormActions>
      </div>
    </Modal>
  );
}

// ---------- PROJECT TASK FORM ----------
export function TaskFormModal({ open, onClose, projectId, editing, index }: {
  open: boolean; onClose: () => void; projectId: string; editing?: ProjectTask; index?: number;
}) {
  const { addProjectTask, updateProjectTask, addToast } = useAppState();
  const { saving, run } = useSaving();
  const [f, setF] = useState({
    name: editing?.name || '',
    assignedTo: editing?.assignedTo || '',
    dueDate: editing?.dueDate || '',
    status: editing?.status || 'Not Started',
    priority: editing?.priority || 'Normal',
  });
  const [err, setErr] = useState('');
  const set = (k: keyof typeof f, v: string) => setF(p => ({ ...p, [k]: v }));

  const submit = () => {
    if (!f.name.trim()) { setErr('Task name is required'); return; }
    run(() => {
      const task: ProjectTask = {
        name: f.name, status: f.status as ProjectTask['status'],
        assignedTo: f.assignedTo || undefined, dueDate: f.dueDate || undefined,
        priority: f.priority as ProjectTask['priority'],
      };
      if (editing && index !== undefined) { updateProjectTask(projectId, index, task); addToast('Task updated.'); }
      else { addProjectTask(projectId, task); addToast('Task added.'); }
      onClose();
    });
  };

  return (
    <Modal open={open} onClose={onClose} title={editing ? 'Edit Task' : 'Add Task'}>
      <div className="space-y-4">
        <FormField label="Task Name" required error={err}>
          <Input value={f.name} onChange={e => { set('name', e.target.value); setErr(''); }} placeholder="e.g. Install control panel" invalid={!!err} />
        </FormField>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Assigned Person / Team">
            <FormSelect value={f.assignedTo} onChange={v => set('assignedTo', v)} options={STAFF} placeholder="Unassigned" />
          </FormField>
          <FormField label="Due Date">
            <Input type="date" value={f.dueDate} onChange={e => set('dueDate', e.target.value)} />
          </FormField>
          <FormField label="Status">
            <FormSelect value={f.status} onChange={v => set('status', v)} options={[...PROJECT_TASK_STATUSES]} />
          </FormField>
          <FormField label="Priority">
            <FormSelect value={f.priority} onChange={v => set('priority', v)} options={[...PRIORITIES]} />
          </FormField>
        </div>
        <FormActions>
          <Button variant="secondary" size="sm" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button size="sm" onClick={submit} disabled={saving}>{saving ? 'Saving…' : editing ? 'Save' : 'Add Task'}</Button>
        </FormActions>
      </div>
    </Modal>
  );
}

// ---------- PROJECT MATERIAL FORM ----------
export function MaterialReqFormModal({ open, onClose, projectId, editing, index }: {
  open: boolean; onClose: () => void; projectId: string; editing?: ProjectMaterial; index?: number;
}) {
  const { addProjectMaterial, updateProjectMaterial, addToast } = useAppState();
  const { saving, run } = useSaving();
  const [f, setF] = useState({
    item: editing?.item || '',
    required: editing ? String(editing.required) : '1',
    available: editing ? String(editing.available) : '0',
    ordered: editing ? String(editing.ordered) : '0',
    unit: editing?.unit || 'units',
    notes: editing?.notes || '',
  });
  const [err, setErr] = useState('');
  const set = (k: keyof typeof f, v: string) => setF(p => ({ ...p, [k]: v }));

  const submit = () => {
    if (!f.item.trim()) { setErr('Material name is required'); return; }
    run(() => {
      const mat = {
        item: f.item, required: Number(f.required) || 0, available: Number(f.available) || 0,
        ordered: Number(f.ordered) || 0, unit: f.unit, notes: f.notes || undefined,
      };
      if (editing && index !== undefined) { updateProjectMaterial(projectId, index, mat); addToast('Material updated.'); }
      else { addProjectMaterial(projectId, mat); addToast('Material requirement added.'); }
      onClose();
    });
  };

  return (
    <Modal open={open} onClose={onClose} title={editing ? 'Edit Material' : 'Add Required Material'}>
      <div className="space-y-4">
        <FormField label="Material" required error={err}>
          <Input value={f.item} onChange={e => { set('item', e.target.value); setErr(''); }} placeholder="e.g. MCCB 250A Breakers" invalid={!!err} />
        </FormField>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Quantity Required"><Input type="number" min="0" value={f.required} onChange={e => set('required', e.target.value)} /></FormField>
          <FormField label="Unit"><FormSelect value={f.unit} onChange={v => set('unit', v)} options={UNITS} /></FormField>
          <FormField label="Quantity Available"><Input type="number" min="0" value={f.available} onChange={e => set('available', e.target.value)} /></FormField>
          <FormField label="Quantity Ordered"><Input type="number" min="0" value={f.ordered} onChange={e => set('ordered', e.target.value)} /></FormField>
        </div>
        <FormField label="Notes">
          <Textarea value={f.notes} onChange={e => set('notes', e.target.value)} rows={2} placeholder="Optional notes…" />
        </FormField>
        <FormActions>
          <Button variant="secondary" size="sm" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button size="sm" onClick={submit} disabled={saving}>{saving ? 'Saving…' : editing ? 'Save' : 'Add Material'}</Button>
        </FormActions>
      </div>
    </Modal>
  );
}

// ---------- PURCHASE REQUEST FORM ----------
interface PRItemRow { description: string; qty: string; unit: string; unitCost: string; }
export function PurchaseRequestFormModal({ open, onClose, presetProject, presetItems }: {
  open: boolean; onClose: () => void;
  presetProject?: { id: string; name: string };
  presetItems?: { description: string; qty: string; unit: string; unitCost?: string }[];
}) {
  const { projects, addPurchaseRequest, addToast } = useAppState();
  const { saving, run } = useSaving();
  const [projectId, setProjectId] = useState(presetProject?.id || '');
  const [requestedBy, setRequestedBy] = useState('');
  const [supplier, setSupplier] = useState('');
  const [requiredBy, setRequiredBy] = useState('');
  const [notes, setNotes] = useState('');
  const [rows, setRows] = useState<PRItemRow[]>(
    presetItems && presetItems.length
      ? presetItems.map(i => ({ description: i.description, qty: i.qty, unit: i.unit, unitCost: i.unitCost || '' }))
      : [{ description: '', qty: '1', unit: 'units', unitCost: '' }]
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const setRow = (i: number, patch: Partial<PRItemRow>) => setRows(rs => rs.map((r, idx) => idx === i ? { ...r, ...patch } : r));
  const addRow = () => setRows(rs => [...rs, { description: '', qty: '1', unit: 'units', unitCost: '' }]);
  const removeRow = (i: number) => setRows(rs => rs.length > 1 ? rs.filter((_, idx) => idx !== i) : rs);
  const rowTotal = (r: PRItemRow) => (Number(r.qty) || 0) * (Number(r.unitCost) || 0);
  const total = rows.reduce((s, r) => s + rowTotal(r), 0);

  const submit = () => {
    const e: Record<string, string> = {};
    if (!projectId) e.project = 'Select a project';
    if (!rows.some(r => r.description.trim())) e.rows = 'Add at least one item';
    setErrors(e);
    if (Object.keys(e).length) return;
    run(() => {
      const project = projects.find(p => p.id === projectId);
      const items = rows.filter(r => r.description.trim()).map(r => ({ description: r.description, qty: `${r.qty} ${r.unit}`.trim() }));
      const id = addPurchaseRequest({
        projectId, project: project?.project || '', requestedBy: requestedBy || 'Tsindikai Mudemba',
        supplier: supplier || 'TBD', requiredBy: requiredBy || TODAY, notes: notes || undefined, items, value: Math.round(total),
      });
      addToast(`Purchase Request ${id} created — awaiting approval.`);
      onClose();
    });
  };

  return (
    <Modal open={open} onClose={onClose} title="Create Purchase Request" width="max-w-2xl">
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Project" required error={errors.project}>
            <FormSelect value={projectId} onChange={setProjectId} options={projects.map(p => ({ value: p.id, label: `${p.id} — ${p.project}` }))} placeholder="Select project" invalid={!!errors.project} disabled={!!presetProject} />
          </FormField>
          <FormField label="Requested By">
            <FormSelect value={requestedBy} onChange={setRequestedBy} options={STAFF} placeholder="Select" />
          </FormField>
          <FormField label="Preferred Supplier">
            <FormSelect value={supplier} onChange={setSupplier} options={SUPPLIERS} placeholder="Select supplier" />
          </FormField>
          <FormField label="Required By">
            <Input type="date" value={requiredBy} onChange={e => setRequiredBy(e.target.value)} />
          </FormField>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-steel-600">Items</p>
            <Button variant="secondary" size="sm" onClick={addRow}><Plus size={13} /> Add Item</Button>
          </div>
          {errors.rows && <p className="text-xs text-red-600 mb-2">{errors.rows}</p>}
          <div className="space-y-3">
            {rows.map((r, i) => (
              <div key={i} className="border border-steel-200 rounded-lg p-3 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-steel-500">Item {i + 1}</span>
                  <button onClick={() => removeRow(i)} className="text-steel-400 hover:text-red-600 disabled:opacity-30" disabled={rows.length === 1}><Trash2 size={14} /></button>
                </div>
                <FormField label="Item"><Input value={r.description} onChange={e => setRow(i, { description: e.target.value })} placeholder="Item description" /></FormField>
                <div className="grid grid-cols-3 gap-2">
                  <FormField label="Qty"><Input type="number" min="0" value={r.qty} onChange={e => setRow(i, { qty: e.target.value })} /></FormField>
                  <FormField label="Unit"><FormSelect value={r.unit} onChange={v => setRow(i, { unit: v })} options={UNITS} /></FormField>
                  <FormField label="Unit Cost"><Input type="number" min="0" value={r.unitCost} onChange={e => setRow(i, { unitCost: e.target.value })} /></FormField>
                </div>
                <div className="flex justify-between text-xs pt-1 border-t border-steel-100">
                  <span className="text-steel-500">Line total</span>
                  <span className="font-semibold text-navy-900">{formatCurrency(Math.round(rowTotal(r)))}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-3 pt-3 border-t border-steel-200">
            <span className="text-sm font-semibold text-navy-900">Estimated Total</span>
            <span className="text-sm font-bold text-navy-900">{formatCurrency(Math.round(total))}</span>
          </div>
        </div>

        <FormField label="Notes">
          <Textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="Optional notes for approver…" />
        </FormField>

        <FormActions>
          <Button variant="secondary" size="sm" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button size="sm" onClick={submit} disabled={saving}>{saving ? 'Saving…' : 'Create Purchase Request'}</Button>
        </FormActions>
      </div>
    </Modal>
  );
}

// ---------- INVENTORY / MATERIAL FORM ----------
export function InventoryFormModal({ open, onClose, editing }: {
  open: boolean; onClose: () => void; editing?: InventoryItem;
}) {
  const { addInventory, updateInventory, addToast } = useAppState();
  const { saving, run } = useSaving();
  const [f, setF] = useState({
    item: editing?.item || '',
    category: editing?.category || '',
    sku: editing?.sku || '',
    available: editing ? String(editing.available) : '0',
    unit: editing?.unit || 'units',
    reorderLevel: editing ? String(editing.reorderLevel) : '0',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const set = (k: keyof typeof f, v: string) => setF(p => ({ ...p, [k]: v }));

  const submit = () => {
    const e: Record<string, string> = {};
    if (!f.item.trim()) e.item = 'Material name is required';
    if (!f.category) e.category = 'Select a category';
    if (!f.sku.trim()) e.sku = 'SKU is required';
    setErrors(e);
    if (Object.keys(e).length) return;
    run(() => {
      const payload = {
        item: f.item, category: f.category, sku: f.sku.trim(),
        available: Number(f.available) || 0, unit: f.unit, reorderLevel: Number(f.reorderLevel) || 0,
      };
      if (editing) { updateInventory(editing.sku, payload); addToast(`${f.item} updated.`); }
      else { addInventory(payload); addToast(`${f.item} added to inventory.`); }
      onClose();
    });
  };

  return (
    <Modal open={open} onClose={onClose} title={editing ? 'Edit Material' : 'Add Material'}>
      <div className="space-y-4">
        <FormField label="Material Name" required error={errors.item}>
          <Input value={f.item} onChange={e => set('item', e.target.value)} placeholder="e.g. MCCB 250A" invalid={!!errors.item} />
        </FormField>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Category" required error={errors.category}>
            <FormSelect value={f.category} onChange={v => set('category', v)} options={CATEGORIES} placeholder="Select category" invalid={!!errors.category} />
          </FormField>
          <FormField label="SKU" required error={errors.sku}>
            <Input value={f.sku} onChange={e => set('sku', e.target.value)} placeholder="e.g. EL-MCCB-250" invalid={!!errors.sku} disabled={!!editing} />
          </FormField>
          <FormField label="Quantity Available"><Input type="number" min="0" value={f.available} onChange={e => set('available', e.target.value)} /></FormField>
          <FormField label="Unit"><FormSelect value={f.unit} onChange={v => set('unit', v)} options={UNITS} /></FormField>
          <FormField label="Reorder Level" hint="Low stock below this level"><Input type="number" min="0" value={f.reorderLevel} onChange={e => set('reorderLevel', e.target.value)} /></FormField>
        </div>
        <FormActions>
          <Button variant="secondary" size="sm" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button size="sm" onClick={submit} disabled={saving}>{saving ? 'Saving…' : editing ? 'Save' : 'Add Material'}</Button>
        </FormActions>
      </div>
    </Modal>
  );
}

// ---------- EQUIPMENT FORM ----------
export function EquipmentFormModal({ open, onClose, editing }: {
  open: boolean; onClose: () => void; editing?: Equipment;
}) {
  const { addEquipment, updateEquipment, addToast } = useAppState();
  const { saving, run } = useSaving();
  const [f, setF] = useState({
    name: editing?.name || '',
    type: editing?.type || '',
    identifier: editing?.identifier || '',
    condition: editing?.condition || 'Good',
    availability: editing?.availability || 'Available',
    currentAssignment: editing?.currentAssignment || '',
    nextAvailable: editing?.nextAvailable || 'Now',
  });
  const [err, setErr] = useState('');
  const set = (k: keyof typeof f, v: string) => setF(p => ({ ...p, [k]: v }));

  const submit = () => {
    if (!f.name.trim()) { setErr('Equipment name is required'); return; }
    run(() => {
      const payload: Equipment = {
        name: f.name, type: f.type || 'Equipment', identifier: f.identifier || undefined,
        condition: f.condition as Equipment['condition'], availability: f.availability as Equipment['availability'],
        currentAssignment: f.currentAssignment || '—', nextAvailable: f.nextAvailable || 'Now',
      };
      if (editing) { updateEquipment(editing.name, payload); addToast(`${f.name} updated.`); }
      else { addEquipment(payload); addToast(`${f.name} added.`); }
      onClose();
    });
  };

  return (
    <Modal open={open} onClose={onClose} title={editing ? 'Edit Equipment' : 'Add Equipment'}>
      <div className="space-y-4">
        <FormField label="Equipment / Vehicle Name" required error={err}>
          <Input value={f.name} onChange={e => { set('name', e.target.value); setErr(''); }} placeholder="e.g. Toyota Hilux — OML 06" invalid={!!err} disabled={!!editing} />
        </FormField>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Type"><FormSelect value={f.type} onChange={v => set('type', v)} options={EQUIPMENT_TYPES} placeholder="Select type" /></FormField>
          <FormField label="Identifier / Reg No"><Input value={f.identifier} onChange={e => set('identifier', e.target.value)} placeholder="e.g. OML 06 / SN-1234" /></FormField>
          <FormField label="Condition"><FormSelect value={f.condition} onChange={v => set('condition', v)} options={[...EQUIPMENT_CONDITION]} /></FormField>
          <FormField label="Availability"><FormSelect value={f.availability} onChange={v => set('availability', v)} options={[...EQUIPMENT_AVAILABILITY]} /></FormField>
          <FormField label="Current Assignment"><Input value={f.currentAssignment} onChange={e => set('currentAssignment', e.target.value)} placeholder="Project or —" /></FormField>
          <FormField label="Next Available"><Input value={f.nextAvailable} onChange={e => set('nextAvailable', e.target.value)} placeholder="e.g. Now / 10 Sep" /></FormField>
        </div>
        <FormActions>
          <Button variant="secondary" size="sm" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button size="sm" onClick={submit} disabled={saving}>{saving ? 'Saving…' : editing ? 'Save' : 'Add Equipment'}</Button>
        </FormActions>
      </div>
    </Modal>
  );
}

// ---------- LABOUR / TEAM FORM ----------
export function LabourFormModal({ open, onClose, editing }: {
  open: boolean; onClose: () => void; editing?: LabourResource;
}) {
  const { addLabour, updateLabour, addToast } = useAppState();
  const { saving, run } = useSaving();
  const [f, setF] = useState({
    name: editing?.name || '',
    trade: editing?.trade || '',
    currentAssignment: editing?.currentAssignment || '—',
    availability: editing?.availability || 'Available',
    utilisation: editing ? String(editing.utilisation) : '0',
  });
  const [err, setErr] = useState('');
  const set = (k: keyof typeof f, v: string) => setF(p => ({ ...p, [k]: v }));

  const submit = () => {
    if (!f.name.trim()) { setErr('Name is required'); return; }
    run(() => {
      const payload: LabourResource = {
        name: f.name, trade: f.trade || 'General',
        currentAssignment: f.currentAssignment || '—',
        availability: f.availability as LabourResource['availability'],
        utilisation: Math.min(Math.max(Number(f.utilisation) || 0, 0), 100),
      };
      if (editing) { updateLabour(editing.name, payload); addToast(`${f.name} updated.`); }
      else { addLabour(payload); addToast(`${f.name} added.`); }
      onClose();
    });
  };

  return (
    <Modal open={open} onClose={onClose} title={editing ? 'Edit Team Member' : 'Add Employee / Team'}>
      <div className="space-y-4">
        <FormField label="Name" required error={err}>
          <Input value={f.name} onChange={e => { set('name', e.target.value); setErr(''); }} placeholder="e.g. Electrical Team B" invalid={!!err} disabled={!!editing} />
        </FormField>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Trade / Role"><Input value={f.trade} onChange={e => set('trade', e.target.value)} placeholder="e.g. Electrician" /></FormField>
          <FormField label="Current Assignment"><Input value={f.currentAssignment} onChange={e => set('currentAssignment', e.target.value)} placeholder="Project or —" /></FormField>
          <FormField label="Availability"><FormSelect value={f.availability} onChange={v => set('availability', v)} options={[...LABOUR_AVAILABILITY]} /></FormField>
          <FormField label="Utilisation (%)"><Input type="number" min="0" max="100" value={f.utilisation} onChange={e => set('utilisation', e.target.value)} /></FormField>
        </div>
        <FormActions>
          <Button variant="secondary" size="sm" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button size="sm" onClick={submit} disabled={saving}>{saving ? 'Saving…' : editing ? 'Save' : 'Add'}</Button>
        </FormActions>
      </div>
    </Modal>
  );
}

// ---------- INVOICE FORM ----------
export function InvoiceFormModal({ open, onClose, editing, presetProjectId }: {
  open: boolean; onClose: () => void; editing?: Invoice; presetProjectId?: string;
}) {
  const { projects, addInvoice, updateInvoice, addToast } = useAppState();
  const { saving, run } = useSaving();
  const preset = presetProjectId ? projects.find(p => p.id === presetProjectId) : undefined;
  const [f, setF] = useState({
    customer: editing?.customer || preset?.customer || '',
    projectId: editing?.projectId || presetProjectId || '',
    project: editing?.project || preset?.project || '',
    description: editing?.description || '',
    invoiceDate: editing?.invoiceDate || TODAY,
    dueDate: editing?.dueDate || addDaysISO(TODAY, 14),
    amount: editing ? String(editing.amount) : preset ? String(preset.value) : '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const set = (k: keyof typeof f, v: string) => setF(p => ({ ...p, [k]: v }));

  const onProject = (pid: string) => {
    const proj = projects.find(p => p.id === pid);
    setF(p => ({ ...p, projectId: pid, project: proj?.project || p.project, customer: proj?.customer || p.customer, amount: p.amount || (proj ? String(proj.value) : '') }));
  };

  const finish = (draft: boolean) => {
    const e: Record<string, string> = {};
    if (!f.customer.trim()) e.customer = 'Customer is required';
    if (f.amount === '' || isNaN(Number(f.amount)) || Number(f.amount) <= 0) e.amount = 'Enter a valid amount';
    setErrors(e);
    if (Object.keys(e).length) return;
    run(() => {
      if (editing) {
        updateInvoice(editing.id, {
          customer: f.customer, projectId: f.projectId || undefined, project: f.project || '—',
          description: f.description, invoiceDate: f.invoiceDate, dueDate: f.dueDate, amount: Number(f.amount),
        });
        addToast(`Invoice ${editing.id} updated.`);
      } else {
        const id = addInvoice({
          customer: f.customer, projectId: f.projectId || undefined, project: f.project || '—',
          description: f.description, invoiceDate: f.invoiceDate, dueDate: f.dueDate, amount: Number(f.amount), draft,
        });
        addToast(`Invoice ${id} created${draft ? ' as draft' : ' and sent'}.`);
      }
      onClose();
    });
  };

  return (
    <Modal open={open} onClose={onClose} title={editing ? `Edit ${editing.id}` : 'New Invoice'} width="max-w-xl">
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Customer" required error={errors.customer}>
            <Input value={f.customer} onChange={e => set('customer', e.target.value)} placeholder="Customer name" invalid={!!errors.customer} />
          </FormField>
          <FormField label="Project">
            <FormSelect value={f.projectId} onChange={onProject} options={[{ value: '', label: 'None (manual)' }, ...projects.map(p => ({ value: p.id, label: `${p.id} — ${p.project}` }))]} />
          </FormField>
          <FormField label="Invoice Date"><Input type="date" value={f.invoiceDate} onChange={e => set('invoiceDate', e.target.value)} /></FormField>
          <FormField label="Due Date"><Input type="date" value={f.dueDate} onChange={e => set('dueDate', e.target.value)} /></FormField>
          <FormField label="Amount (ZMW)" required error={errors.amount} className="sm:col-span-2">
            <Input type="number" min="0" value={f.amount} onChange={e => set('amount', e.target.value)} placeholder="0" invalid={!!errors.amount} />
          </FormField>
        </div>
        <FormField label="Description">
          <Textarea value={f.description} onChange={e => set('description', e.target.value)} rows={2} placeholder="What is being invoiced…" />
        </FormField>
        <FormActions>
          <Button variant="secondary" size="sm" onClick={onClose} disabled={saving}>Cancel</Button>
          {!editing && <Button variant="secondary" size="sm" onClick={() => finish(true)} disabled={saving}>Save as Draft</Button>}
          <Button size="sm" onClick={() => finish(false)} disabled={saving}>{saving ? 'Saving…' : editing ? 'Save Changes' : 'Create & Send'}</Button>
        </FormActions>
      </div>
    </Modal>
  );
}

// ---------- DOCUMENT FORM ----------
export function DocumentFormModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { projects, addDocument, addToast } = useAppState();
  const { saving, run } = useSaving();
  const [f, setF] = useState({ name: '', type: '', project: '', description: '' });
  const [fileSize, setFileSize] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const set = (k: keyof typeof f, v: string) => setF(p => ({ ...p, [k]: v }));

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileSize(file.size > 1024 * 1024 ? `${(file.size / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(file.size / 1024))} KB`);
      if (!f.name) set('name', file.name);
    }
  };

  const submit = () => {
    const e: Record<string, string> = {};
    if (!f.name.trim()) e.name = 'Document name is required';
    if (!f.type) e.type = 'Select a category';
    setErrors(e);
    if (Object.keys(e).length) return;
    run(() => {
      addDocument({ name: f.name.trim(), type: f.type, project: f.project || '—', date: TODAY, size: fileSize || '—', description: f.description || undefined });
      addToast('Document added.');
      onClose();
    });
  };

  return (
    <Modal open={open} onClose={onClose} title="Add Document">
      <div className="space-y-4">
        <FormField label="Document Name" required error={errors.name}>
          <Input value={f.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Site Inspection Report.pdf" invalid={!!errors.name} />
        </FormField>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Category" required error={errors.type}>
            <FormSelect value={f.type} onChange={v => set('type', v)} options={DOCUMENT_TYPES} placeholder="Select category" invalid={!!errors.type} />
          </FormField>
          <FormField label="Related Project">
            <FormSelect value={f.project} onChange={v => set('project', v)} options={[...new Set(projects.map(p => p.project))]} placeholder="None" />
          </FormField>
        </div>
        <FormField label="Description">
          <Textarea value={f.description} onChange={e => set('description', e.target.value)} rows={2} placeholder="Optional description…" />
        </FormField>
        <FormField label="Attach File" hint="Optional — used only for this demo's display">
          <input type="file" onChange={onFile} className="w-full text-sm text-steel-600 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-navy-800 file:text-white hover:file:bg-navy-900" />
        </FormField>
        <FormActions>
          <Button variant="secondary" size="sm" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button size="sm" onClick={submit} disabled={saving}>{saving ? 'Saving…' : 'Add Document'}</Button>
        </FormActions>
      </div>
    </Modal>
  );
}
