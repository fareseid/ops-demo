import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from 'react';
import {
  requests as initRequests,
  quotations as initQuotations,
  projects as initProjects,
  purchaseRequests as initPRs,
  invoices as initInvoices,
  inventory as initInventory,
  equipment as initEquipment,
  labour as initLabour,
  documents as initDocuments,
  type CustomerRequest,
  type Quotation,
  type QuotationLineItem,
  type Project,
  type ProjectTask,
  type ProjectMaterial,
  type PurchaseRequest,
  type Invoice,
  type InventoryItem,
  type Equipment,
  type LabourResource,
  type DocFile,
  type QuotationStatus,
  type ProcurementStatus,
  type ProjectStatus,
} from '@/data/mock';
import { computeInventoryStatus, computeMaterialStatus, computeInvoiceStatus, TODAY } from '@/lib/utils';

const STORAGE_KEY = 'omusiba-state-v2';

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface PersistShape {
  requests: CustomerRequest[];
  quotations: Quotation[];
  projects: Project[];
  purchaseRequests: PurchaseRequest[];
  invoices: Invoice[];
  inventory: InventoryItem[];
  equipment: Equipment[];
  labour: LabourResource[];
  documents: DocFile[];
}

function clone<T>(v: T): T {
  return typeof structuredClone === 'function' ? structuredClone(v) : JSON.parse(JSON.stringify(v));
}

function initialData(): PersistShape {
  return {
    requests: clone(initRequests),
    quotations: clone(initQuotations),
    projects: clone(initProjects),
    purchaseRequests: clone(initPRs),
    invoices: clone(initInvoices),
    inventory: clone(initInventory),
    equipment: clone(initEquipment),
    labour: clone(initLabour),
    documents: clone(initDocuments),
  };
}

function loadData(): PersistShape {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<PersistShape>;
      const base = initialData();
      return { ...base, ...parsed };
    }
  } catch {
    /* ignore */
  }
  return initialData();
}

function nextNumber(existing: string[], prefix: string, floor = 0, pad = 3): string {
  let max = floor;
  for (const id of existing) {
    const m = id && id.match(/(\d+)\s*$/);
    if (m) max = Math.max(max, parseInt(m[1], 10));
  }
  return `${prefix}${String(max + 1).padStart(pad, '0')}`;
}

function projectProgress(tasks: ProjectTask[], fallback: number): number {
  if (!tasks.length) return fallback;
  const done = tasks.filter(t => t.status === 'Complete').length;
  const partial = tasks.filter(t => t.status === 'In Progress').length;
  return Math.round(((done + partial * 0.5) / tasks.length) * 100);
}

export interface NewRequestInput {
  customer: string; contactPerson: string; phone: string; email: string;
  service: string; category: string; location: string; description: string;
  priority: CustomerRequest['priority']; assignedTo: string; received: string;
  requirements?: string; notes: string;
}

export interface NewQuotationInput {
  requestId?: string; customer: string; project: string; contactPerson: string;
  owner: string; created: string; validUntil: string; paymentTerms: string;
  deliveryTimeframe: string; lineItems: QuotationLineItem[]; vat: number; notes?: string;
}

export interface NewProjectInput {
  quotationId?: string; customer: string; project: string; category: string;
  location: string; projectManager: string; startDate: string; targetCompletion: string;
  value: number; scope: string; customerContact: string; status: ProjectStatus;
}

export interface NewPRInput {
  projectId: string; project: string; requestedBy: string; supplier: string;
  requiredBy: string; notes?: string; items: { description: string; qty: string; }[]; value: number;
}

export interface NewInvoiceInput {
  customer: string; projectId?: string; project: string; description?: string;
  invoiceDate: string; dueDate: string; amount: number; draft?: boolean;
}

interface AppState extends PersistShape {
  toasts: Toast[];
  // toasts
  addToast: (message: string, type?: Toast['type']) => void;
  removeToast: (id: number) => void;
  // requests
  addRequest: (input: NewRequestInput) => string;
  updateRequest: (id: string, patch: Partial<CustomerRequest>) => void;
  deleteRequest: (id: string) => void;
  // quotations
  addQuotation: (input: NewQuotationInput) => string;
  updateQuotation: (id: string, input: NewQuotationInput) => void;
  deleteQuotation: (id: string) => void;
  updateQuotationStatus: (id: string, status: QuotationStatus) => void;
  createProjectFromQuotation: (quotationId: string, extra?: Partial<NewProjectInput>) => string | null;
  // projects
  addProject: (input: NewProjectInput) => string;
  updateProject: (id: string, patch: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  updateProjectStatus: (id: string, status: ProjectStatus) => void;
  addProjectTask: (projectId: string, task: ProjectTask) => void;
  updateProjectTask: (projectId: string, index: number, patch: Partial<ProjectTask>) => void;
  deleteProjectTask: (projectId: string, index: number) => void;
  toggleProjectTask: (projectId: string, index: number) => void;
  addProjectMaterial: (projectId: string, mat: Omit<ProjectMaterial, 'status'>) => void;
  updateProjectMaterial: (projectId: string, index: number, patch: Partial<ProjectMaterial>) => void;
  deleteProjectMaterial: (projectId: string, index: number) => void;
  // purchase requests
  addPurchaseRequest: (input: NewPRInput) => string;
  updatePRStatus: (id: string, status: ProcurementStatus) => void;
  approvePR: (id: string) => void;
  rejectPR: (id: string) => void;
  convertToPO: (id: string) => string;
  markPRReceived: (id: string) => void;
  // inventory
  addInventory: (item: Omit<InventoryItem, 'status' | 'reserved'> & { reserved?: number }) => void;
  updateInventory: (sku: string, patch: Partial<InventoryItem>) => void;
  deleteInventory: (sku: string) => void;
  // equipment
  addEquipment: (e: Equipment) => void;
  updateEquipment: (name: string, patch: Partial<Equipment>) => void;
  deleteEquipment: (name: string) => void;
  // labour
  addLabour: (l: LabourResource) => void;
  updateLabour: (name: string, patch: Partial<LabourResource>) => void;
  deleteLabour: (name: string) => void;
  // invoices
  addInvoice: (input: NewInvoiceInput) => string;
  updateInvoice: (id: string, patch: Partial<Invoice>) => void;
  deleteInvoice: (id: string) => void;
  recordPayment: (invoiceId: string, amount: number, method: string, reference: string, date?: string, notes?: string) => void;
  // documents
  addDocument: (doc: DocFile) => void;
  deleteDocument: (name: string) => void;
  // demo
  resetDemo: () => void;
}

const AppContext = createContext<AppState | null>(null);

let toastId = 0;

export function AppProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<PersistShape>(loadData);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const skipPersist = useRef(false);

  useEffect(() => {
    if (skipPersist.current) { skipPersist.current = false; return; }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      /* ignore quota */
    }
  }, [data]);

  const addToast = useCallback((message: string, type: Toast['type'] = 'success') => {
    const id = ++toastId;
    setToasts(t => [...t, { id, message, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4000);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts(t => t.filter(x => x.id !== id));
  }, []);

  // ---------- REQUESTS ----------
  const addRequest = useCallback((input: NewRequestInput): string => {
    let id = '';
    setData(d => {
      id = nextNumber(d.requests.map(r => r.id), 'REQ-2026-');
      const req: CustomerRequest = {
        id,
        customer: input.customer,
        contactPerson: input.contactPerson,
        phone: input.phone,
        email: input.email,
        service: input.service,
        category: input.category,
        location: input.location,
        received: input.received || TODAY,
        assignedTo: input.assignedTo,
        priority: input.priority,
        status: 'New',
        description: input.description,
        requirements: input.requirements || '',
        notes: input.notes,
      };
      return { ...d, requests: [req, ...d.requests] };
    });
    return id;
  }, []);

  const updateRequest = useCallback((id: string, patch: Partial<CustomerRequest>) => {
    setData(d => ({ ...d, requests: d.requests.map(r => r.id === id ? { ...r, ...patch } : r) }));
  }, []);

  const deleteRequest = useCallback((id: string) => {
    setData(d => ({ ...d, requests: d.requests.filter(r => r.id !== id) }));
  }, []);

  // ---------- QUOTATIONS ----------
  const addQuotation = useCallback((input: NewQuotationInput): string => {
    let id = '';
    setData(d => {
      id = nextNumber(d.quotations.map(q => q.id), 'Q-2026-');
      const amount = input.lineItems.reduce((s, li) => s + li.total, 0);
      const q: Quotation = {
        id,
        requestId: input.requestId,
        customer: input.customer,
        project: input.project,
        amount,
        created: input.created || TODAY,
        validUntil: input.validUntil,
        owner: input.owner,
        status: 'Draft',
        contactPerson: input.contactPerson,
        paymentTerms: input.paymentTerms,
        deliveryTimeframe: input.deliveryTimeframe,
        lineItems: input.lineItems,
        vat: input.vat,
        notes: input.notes,
      };
      const requests = input.requestId
        ? d.requests.map(r => r.id === input.requestId ? { ...r, status: 'Quoted' as const } : r)
        : d.requests;
      return { ...d, quotations: [q, ...d.quotations], requests };
    });
    return id;
  }, []);

  const updateQuotation = useCallback((id: string, input: NewQuotationInput) => {
    setData(d => {
      const amount = input.lineItems.reduce((s, li) => s + li.total, 0);
      const quotations = d.quotations.map(q => q.id === id ? {
        ...q,
        requestId: input.requestId,
        customer: input.customer,
        project: input.project,
        amount,
        created: input.created,
        validUntil: input.validUntil,
        owner: input.owner,
        contactPerson: input.contactPerson,
        paymentTerms: input.paymentTerms,
        deliveryTimeframe: input.deliveryTimeframe,
        lineItems: input.lineItems,
        vat: input.vat,
        notes: input.notes,
      } : q);
      const requests = input.requestId
        ? d.requests.map(r => r.id === input.requestId && r.status !== 'Quoted' ? { ...r, status: 'Quoted' as const } : r)
        : d.requests;
      return { ...d, quotations, requests };
    });
  }, []);

  const deleteQuotation = useCallback((id: string) => {
    setData(d => ({ ...d, quotations: d.quotations.filter(q => q.id !== id) }));
  }, []);

  const updateQuotationStatus = useCallback((id: string, status: QuotationStatus) => {
    setData(d => ({ ...d, quotations: d.quotations.map(q => q.id === id ? { ...q, status } : q) }));
  }, []);

  const createProjectFromQuotation = useCallback((quotationId: string, extra?: Partial<NewProjectInput>): string | null => {
    let id: string | null = null;
    setData(d => {
      const q = d.quotations.find(x => x.id === quotationId);
      if (!q) return d;
      id = nextNumber(d.projects.map(p => p.id), 'PRJ-2026-');
      // try to inherit location/category from linked request
      const req = q.requestId ? d.requests.find(r => r.id === q.requestId) : undefined;
      const project: Project = {
        id,
        quotationId,
        customer: q.customer,
        project: extra?.project || q.project,
        category: extra?.category || req?.category || 'General',
        location: extra?.location || req?.location || '',
        projectManager: extra?.projectManager || q.owner,
        startDate: extra?.startDate || TODAY,
        targetCompletion: extra?.targetCompletion || q.validUntil,
        value: q.amount,
        progress: 0,
        status: extra?.status || 'Planning',
        scope: extra?.scope || `Delivery of ${q.project} as per accepted quotation ${q.id}.`,
        customerContact: q.contactPerson,
        tasks: [],
        materials: [],
        team: [{ name: extra?.projectManager || q.owner, role: 'Project Manager' }],
        costs: { quotedRevenue: q.amount, materialCost: 0, labourCost: 0, transport: 0, otherCosts: 0 },
      };
      const quotations = d.quotations.map(x => x.id === quotationId ? { ...x, projectId: id!, status: 'Accepted' as const } : x);
      return { ...d, projects: [project, ...d.projects], quotations };
    });
    return id;
  }, []);

  // ---------- PROJECTS ----------
  const addProject = useCallback((input: NewProjectInput): string => {
    let id = '';
    setData(d => {
      id = nextNumber(d.projects.map(p => p.id), 'PRJ-2026-');
      const project: Project = {
        id,
        quotationId: input.quotationId,
        customer: input.customer,
        project: input.project,
        category: input.category,
        location: input.location,
        projectManager: input.projectManager,
        startDate: input.startDate,
        targetCompletion: input.targetCompletion,
        value: input.value,
        progress: 0,
        status: input.status,
        scope: input.scope,
        customerContact: input.customerContact,
        tasks: [],
        materials: [],
        team: input.projectManager ? [{ name: input.projectManager, role: 'Project Manager' }] : [],
        costs: { quotedRevenue: input.value, materialCost: 0, labourCost: 0, transport: 0, otherCosts: 0 },
      };
      const quotations = input.quotationId
        ? d.quotations.map(q => q.id === input.quotationId ? { ...q, projectId: id, status: 'Accepted' as const } : q)
        : d.quotations;
      return { ...d, projects: [project, ...d.projects], quotations };
    });
    return id;
  }, []);

  const updateProject = useCallback((id: string, patch: Partial<Project>) => {
    setData(d => ({ ...d, projects: d.projects.map(p => p.id === id ? { ...p, ...patch } : p) }));
  }, []);

  const deleteProject = useCallback((id: string) => {
    setData(d => ({ ...d, projects: d.projects.filter(p => p.id !== id) }));
  }, []);

  const updateProjectStatus = useCallback((id: string, status: ProjectStatus) => {
    setData(d => ({ ...d, projects: d.projects.map(p => p.id === id ? { ...p, status } : p) }));
  }, []);

  const recomputeProject = (p: Project): Project => ({ ...p, progress: projectProgress(p.tasks, p.progress) });

  const addProjectTask = useCallback((projectId: string, task: ProjectTask) => {
    setData(d => ({ ...d, projects: d.projects.map(p => p.id === projectId ? recomputeProject({ ...p, tasks: [...p.tasks, task] }) : p) }));
  }, []);

  const updateProjectTask = useCallback((projectId: string, index: number, patch: Partial<ProjectTask>) => {
    setData(d => ({ ...d, projects: d.projects.map(p => {
      if (p.id !== projectId) return p;
      const tasks = p.tasks.map((t, i) => i === index ? { ...t, ...patch } : t);
      return recomputeProject({ ...p, tasks });
    }) }));
  }, []);

  const deleteProjectTask = useCallback((projectId: string, index: number) => {
    setData(d => ({ ...d, projects: d.projects.map(p => {
      if (p.id !== projectId) return p;
      return recomputeProject({ ...p, tasks: p.tasks.filter((_, i) => i !== index) });
    }) }));
  }, []);

  const toggleProjectTask = useCallback((projectId: string, index: number) => {
    setData(d => ({ ...d, projects: d.projects.map(p => {
      if (p.id !== projectId) return p;
      const tasks = p.tasks.map((t, i) => {
        if (i !== index) return t;
        const next: ProjectTask['status'] = t.status === 'Complete' ? 'Not Started' : t.status === 'In Progress' ? 'Complete' : 'In Progress';
        return { ...t, status: next };
      });
      return recomputeProject({ ...p, tasks });
    }) }));
  }, []);

  const addProjectMaterial = useCallback((projectId: string, mat: Omit<ProjectMaterial, 'status'>) => {
    setData(d => ({ ...d, projects: d.projects.map(p => {
      if (p.id !== projectId) return p;
      const status = computeMaterialStatus(mat.required, mat.available, mat.ordered);
      return { ...p, materials: [...p.materials, { ...mat, status }] };
    }) }));
  }, []);

  const updateProjectMaterial = useCallback((projectId: string, index: number, patch: Partial<ProjectMaterial>) => {
    setData(d => ({ ...d, projects: d.projects.map(p => {
      if (p.id !== projectId) return p;
      const materials = p.materials.map((m, i) => {
        if (i !== index) return m;
        const merged = { ...m, ...patch };
        merged.status = computeMaterialStatus(merged.required, merged.available, merged.ordered);
        return merged;
      });
      return { ...p, materials };
    }) }));
  }, []);

  const deleteProjectMaterial = useCallback((projectId: string, index: number) => {
    setData(d => ({ ...d, projects: d.projects.map(p => p.id === projectId ? { ...p, materials: p.materials.filter((_, i) => i !== index) } : p) }));
  }, []);

  // ---------- PURCHASE REQUESTS ----------
  const addPurchaseRequest = useCallback((input: NewPRInput): string => {
    let id = '';
    setData(d => {
      id = nextNumber(d.purchaseRequests.map(p => p.id), 'PR-2026-');
      const pr: PurchaseRequest = {
        id,
        projectId: input.projectId,
        project: input.project,
        requestedBy: input.requestedBy,
        supplier: input.supplier,
        items: input.items,
        value: input.value,
        requiredBy: input.requiredBy,
        status: 'Approval Required',
        notes: input.notes,
      };
      return { ...d, purchaseRequests: [pr, ...d.purchaseRequests] };
    });
    return id;
  }, []);

  const updatePRStatus = useCallback((id: string, status: ProcurementStatus) => {
    setData(d => ({ ...d, purchaseRequests: d.purchaseRequests.map(pr => pr.id === id ? { ...pr, status } : pr) }));
  }, []);

  const approvePR = useCallback((id: string) => {
    setData(d => ({ ...d, purchaseRequests: d.purchaseRequests.map(pr => pr.id === id ? { ...pr, status: 'Approved' as const } : pr) }));
  }, []);

  const rejectPR = useCallback((id: string) => {
    setData(d => ({ ...d, purchaseRequests: d.purchaseRequests.map(pr => pr.id === id ? { ...pr, status: 'Draft' as const } : pr) }));
  }, []);

  const convertToPO = useCallback((id: string): string => {
    let po = '';
    setData(d => {
      const existingPOs = d.purchaseRequests.map(p => p.poNumber || '').filter(Boolean);
      po = nextNumber(existingPOs, 'PO-2026-', 28);
      return { ...d, purchaseRequests: d.purchaseRequests.map(pr => pr.id === id ? { ...pr, status: 'PO Issued' as const, poNumber: po } : pr) };
    });
    return po;
  }, []);

  const markPRReceived = useCallback((id: string) => {
    setData(d => {
      const pr = d.purchaseRequests.find(p => p.id === id);
      const purchaseRequests = d.purchaseRequests.map(p => p.id === id ? { ...p, status: 'Received' as const } : p);
      let projects = d.projects;
      // Update matching project materials: move ordered -> available
      if (pr) {
        projects = d.projects.map(proj => {
          if (proj.id !== pr.projectId) return proj;
          const materials = proj.materials.map(m => {
            if (m.ordered > 0) {
              const available = m.available + m.ordered;
              return { ...m, available, ordered: 0, status: computeMaterialStatus(m.required, available, 0) };
            }
            return m;
          });
          return { ...proj, materials };
        });
      }
      return { ...d, purchaseRequests, projects };
    });
  }, []);

  // ---------- INVENTORY ----------
  const addInventory = useCallback((item: Omit<InventoryItem, 'status' | 'reserved'> & { reserved?: number }) => {
    setData(d => {
      const reserved = item.reserved ?? 0;
      const status = computeInventoryStatus(item.available, item.reorderLevel);
      return { ...d, inventory: [{ ...item, reserved, status }, ...d.inventory] };
    });
  }, []);

  const updateInventory = useCallback((sku: string, patch: Partial<InventoryItem>) => {
    setData(d => ({ ...d, inventory: d.inventory.map(i => {
      if (i.sku !== sku) return i;
      const merged = { ...i, ...patch };
      merged.status = computeInventoryStatus(merged.available, merged.reorderLevel);
      return merged;
    }) }));
  }, []);

  const deleteInventory = useCallback((sku: string) => {
    setData(d => ({ ...d, inventory: d.inventory.filter(i => i.sku !== sku) }));
  }, []);

  // ---------- EQUIPMENT ----------
  const addEquipment = useCallback((e: Equipment) => {
    setData(d => ({ ...d, equipment: [e, ...d.equipment] }));
  }, []);
  const updateEquipment = useCallback((name: string, patch: Partial<Equipment>) => {
    setData(d => ({ ...d, equipment: d.equipment.map(e => e.name === name ? { ...e, ...patch } : e) }));
  }, []);
  const deleteEquipment = useCallback((name: string) => {
    setData(d => ({ ...d, equipment: d.equipment.filter(e => e.name !== name) }));
  }, []);

  // ---------- LABOUR ----------
  const addLabour = useCallback((l: LabourResource) => {
    setData(d => ({ ...d, labour: [l, ...d.labour] }));
  }, []);
  const updateLabour = useCallback((name: string, patch: Partial<LabourResource>) => {
    setData(d => ({ ...d, labour: d.labour.map(l => l.name === name ? { ...l, ...patch } : l) }));
  }, []);
  const deleteLabour = useCallback((name: string) => {
    setData(d => ({ ...d, labour: d.labour.filter(l => l.name !== name) }));
  }, []);

  // ---------- INVOICES ----------
  const addInvoice = useCallback((input: NewInvoiceInput): string => {
    let id = '';
    setData(d => {
      id = nextNumber(d.invoices.map(i => i.id), 'INV-2026-');
      const status = computeInvoiceStatus(input.amount, input.amount, input.dueDate, input.draft);
      const inv: Invoice = {
        id,
        customer: input.customer,
        projectId: input.projectId,
        project: input.project,
        description: input.description,
        invoiceDate: input.invoiceDate || TODAY,
        dueDate: input.dueDate,
        amount: input.amount,
        paid: 0,
        balance: input.amount,
        status,
        payments: [],
      };
      return { ...d, invoices: [inv, ...d.invoices] };
    });
    return id;
  }, []);

  const updateInvoice = useCallback((id: string, patch: Partial<Invoice>) => {
    setData(d => ({ ...d, invoices: d.invoices.map(inv => {
      if (inv.id !== id) return inv;
      const merged = { ...inv, ...patch };
      merged.balance = merged.amount - merged.paid;
      const draft = merged.status === 'Draft' && merged.paid === 0;
      merged.status = computeInvoiceStatus(merged.amount, merged.balance, merged.dueDate, draft);
      return merged;
    }) }));
  }, []);

  const deleteInvoice = useCallback((id: string) => {
    setData(d => ({ ...d, invoices: d.invoices.filter(i => i.id !== id) }));
  }, []);

  const recordPayment = useCallback((invoiceId: string, amount: number, method: string, reference: string, date?: string, notes?: string) => {
    setData(d => ({ ...d, invoices: d.invoices.map(inv => {
      if (inv.id !== invoiceId) return inv;
      const newPaid = inv.paid + amount;
      const newBalance = inv.amount - newPaid;
      return {
        ...inv,
        paid: newPaid,
        balance: newBalance,
        status: computeInvoiceStatus(inv.amount, newBalance, inv.dueDate),
        payments: [...inv.payments, { date: date || TODAY, amount, method, reference, notes }],
      };
    }) }));
  }, []);

  // ---------- DOCUMENTS ----------
  const addDocument = useCallback((doc: DocFile) => {
    setData(d => ({ ...d, documents: [doc, ...d.documents] }));
  }, []);
  const deleteDocument = useCallback((name: string) => {
    setData(d => ({ ...d, documents: d.documents.filter(x => x.name !== name) }));
  }, []);

  // ---------- DEMO RESET ----------
  const resetDemo = useCallback(() => {
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
    skipPersist.current = false;
    setData(initialData());
  }, []);

  return (
    <AppContext.Provider value={{
      ...data,
      toasts,
      addToast, removeToast,
      addRequest, updateRequest, deleteRequest,
      addQuotation, updateQuotation, deleteQuotation, updateQuotationStatus, createProjectFromQuotation,
      addProject, updateProject, deleteProject, updateProjectStatus,
      addProjectTask, updateProjectTask, deleteProjectTask, toggleProjectTask,
      addProjectMaterial, updateProjectMaterial, deleteProjectMaterial,
      addPurchaseRequest, updatePRStatus, approvePR, rejectPR, convertToPO, markPRReceived,
      addInventory, updateInventory, deleteInventory,
      addEquipment, updateEquipment, deleteEquipment,
      addLabour, updateLabour, deleteLabour,
      addInvoice, updateInvoice, deleteInvoice, recordPayment,
      addDocument, deleteDocument,
      resetDemo,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppState() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppState must be used within AppProvider');
  return ctx;
}
