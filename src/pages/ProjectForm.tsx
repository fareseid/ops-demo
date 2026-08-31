import { useState } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAppState, type NewProjectInput } from '@/hooks/useAppState';
import { Button, FormField, Input, Textarea, FormSelect } from '@/components/ui';
import { CATEGORIES, PROJECT_MANAGERS, PROJECT_STATUSES } from '@/data/options';
import { formatCurrency, TODAY } from '@/lib/utils';
import { ArrowLeft, Receipt } from 'lucide-react';

function addDays(iso: string, days: number): string {
  const d = new Date(iso || TODAY);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function ProjectForm() {
  const { id } = useParams<{ id: string }>();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { projects, quotations, requests, addProject, updateProject, addToast } = useAppState();

  const editing = id ? projects.find(p => p.id === id) : undefined;
  const quotationId = params.get('quotationId') || editing?.quotationId || '';
  const sourceQuote = quotations.find(q => q.id === quotationId);
  const sourceReq = sourceQuote?.requestId ? requests.find(r => r.id === sourceQuote.requestId) : undefined;

  const [f, setF] = useState({
    quotationId,
    customer: editing?.customer || sourceQuote?.customer || '',
    project: editing?.project || sourceQuote?.project || '',
    category: editing?.category || sourceReq?.category || '',
    location: editing?.location || sourceReq?.location || '',
    projectManager: editing?.projectManager || '',
    startDate: editing?.startDate || TODAY,
    targetCompletion: editing?.targetCompletion || addDays(TODAY, 21),
    value: editing ? String(editing.value) : sourceQuote ? String(sourceQuote.amount) : '',
    scope: editing?.scope || (sourceQuote ? `Delivery of ${sourceQuote.project} as per accepted quotation ${sourceQuote.id}.` : ''),
    customerContact: editing?.customerContact || sourceQuote?.contactPerson || '',
    status: editing?.status || 'Planning',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const set = (k: keyof typeof f, v: string) => setF(p => ({ ...p, [k]: v }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!f.customer.trim()) e.customer = 'Customer is required';
    if (!f.project.trim()) e.project = 'Project name is required';
    if (!f.category) e.category = 'Select a category';
    if (f.value === '' || isNaN(Number(f.value))) e.value = 'Enter a project value';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = () => {
    if (!validate()) { addToast('Please fix the highlighted fields.', 'error'); return; }
    setSaving(true);
    setTimeout(() => {
      if (editing) {
        updateProject(editing.id, {
          customer: f.customer, project: f.project, category: f.category, location: f.location,
          projectManager: f.projectManager, startDate: f.startDate, targetCompletion: f.targetCompletion,
          value: Number(f.value), scope: f.scope, customerContact: f.customerContact,
          status: f.status as NewProjectInput['status'],
        });
        addToast(`Project ${editing.id} updated.`);
        navigate(`/projects/${editing.id}`);
      } else {
        const input: NewProjectInput = {
          quotationId: f.quotationId || undefined,
          customer: f.customer, project: f.project, category: f.category, location: f.location,
          projectManager: f.projectManager, startDate: f.startDate, targetCompletion: f.targetCompletion,
          value: Number(f.value), scope: f.scope, customerContact: f.customerContact,
          status: f.status as NewProjectInput['status'],
        };
        const newId = addProject(input);
        addToast(`Project ${newId} created${f.quotationId ? ` from ${f.quotationId}` : ''}.`);
        navigate(`/projects/${newId}`);
      }
      setSaving(false);
    }, 500);
  };

  return (
    <div className="pb-24 sm:pb-0">
      <div className="flex items-center gap-2 text-sm text-steel-500 mb-4">
        <Link to="/projects" className="hover:text-navy-700 flex items-center gap-1"><ArrowLeft size={14} /> Projects</Link>
        <span>/</span>
        <span className="text-navy-900 font-medium">{editing ? `Edit ${editing.id}` : 'New Project'}</span>
      </div>

      <h1 className="text-lg sm:text-xl font-semibold text-navy-900 mb-1">{editing ? `Edit Project ${editing.id}` : 'Create Project'}</h1>
      <p className="text-sm text-steel-500 mb-6">{editing ? 'Update project details' : 'Set up a new project or job'}</p>

      {sourceQuote && !editing && (
        <div className="bg-steel-50 border border-steel-200 rounded-lg p-3 mb-6 flex items-center gap-2 text-sm text-steel-600">
          <Receipt size={16} className="text-navy-600" /> Prefilled from accepted quotation <span className="font-medium text-navy-800">{sourceQuote.id}</span> · {formatCurrency(sourceQuote.amount)}
        </div>
      )}

      <div className="bg-white rounded-lg border border-steel-200 p-4 sm:p-6 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <FormField label="Customer" required error={errors.customer}>
            <Input value={f.customer} onChange={e => set('customer', e.target.value)} placeholder="Customer name" invalid={!!errors.customer} />
          </FormField>
          <FormField label="Project Name" required error={errors.project}>
            <Input value={f.project} onChange={e => set('project', e.target.value)} placeholder="e.g. Electrical Panel Upgrade" invalid={!!errors.project} />
          </FormField>
          <FormField label="Category" required error={errors.category}>
            <FormSelect value={f.category} onChange={v => set('category', v)} options={CATEGORIES} placeholder="Select category" invalid={!!errors.category} />
          </FormField>
          <FormField label="Location">
            <Input value={f.location} onChange={e => set('location', e.target.value)} placeholder="e.g. Kitwe" />
          </FormField>
          <FormField label="Project Manager">
            <FormSelect value={f.projectManager} onChange={v => set('projectManager', v)} options={PROJECT_MANAGERS} placeholder="Assign a manager" />
          </FormField>
          <FormField label="Customer Contact">
            <Input value={f.customerContact} onChange={e => set('customerContact', e.target.value)} placeholder="Contact person" />
          </FormField>
          <FormField label="Start Date">
            <Input type="date" value={f.startDate} onChange={e => set('startDate', e.target.value)} />
          </FormField>
          <FormField label="Target Completion">
            <Input type="date" value={f.targetCompletion} onChange={e => set('targetCompletion', e.target.value)} />
          </FormField>
          <FormField label="Project Value (ZMW)" required error={errors.value}>
            <Input type="number" min="0" value={f.value} onChange={e => set('value', e.target.value)} placeholder="0" invalid={!!errors.value} />
          </FormField>
          <FormField label="Status">
            <FormSelect value={f.status} onChange={v => set('status', v)} options={[...PROJECT_STATUSES]} />
          </FormField>
        </div>
        <FormField label="Scope of Work" className="mt-4">
          <Textarea value={f.scope} onChange={e => set('scope', e.target.value)} placeholder="Describe the scope of work…" rows={3} />
        </FormField>
      </div>

      <div className="hidden sm:flex justify-end gap-2">
        <Button variant="secondary" onClick={() => navigate(editing ? `/projects/${editing.id}` : '/projects')} disabled={saving}>Cancel</Button>
        <Button onClick={submit} disabled={saving}>{saving ? 'Saving…' : editing ? 'Save Changes' : 'Create Project'}</Button>
      </div>

      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-steel-200 p-3 flex gap-2 z-20">
        <Button variant="secondary" className="flex-1 justify-center" onClick={() => navigate(editing ? `/projects/${editing.id}` : '/projects')} disabled={saving}>Cancel</Button>
        <Button className="flex-1 justify-center" onClick={submit} disabled={saving}>{saving ? 'Saving…' : editing ? 'Save' : 'Create'}</Button>
      </div>
    </div>
  );
}
