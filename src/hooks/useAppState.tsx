import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import {
  requests as initRequests,
  quotations as initQuotations,
  projects as initProjects,
  purchaseRequests as initPRs,
  invoices as initInvoices,
  inventory as initInventory,
  type CustomerRequest,
  type Quotation,
  type Project,
  type PurchaseRequest,
  type Invoice,
  type InventoryItem,
  type QuotationStatus,
  type ProcurementStatus,
  type ProjectStatus,
} from '@/data/mock';

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface AppState {
  requests: CustomerRequest[];
  quotations: Quotation[];
  projects: Project[];
  purchaseRequests: PurchaseRequest[];
  invoices: Invoice[];
  inventory: InventoryItem[];
  toasts: Toast[];
  updateQuotationStatus: (id: string, status: QuotationStatus) => void;
  updatePRStatus: (id: string, status: ProcurementStatus) => void;
  updateProjectStatus: (id: string, status: ProjectStatus) => void;
  toggleProjectTask: (projectId: string, taskIndex: number) => void;
  recordPayment: (invoiceId: string, amount: number, method: string, reference: string) => void;
  addToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: number) => void;
}

const AppContext = createContext<AppState | null>(null);

let toastId = 0;

export function AppProvider({ children }: { children: ReactNode }) {
  const [requests] = useState(initRequests);
  const [quotations, setQuotations] = useState(initQuotations);
  const [projects, setProjects] = useState(initProjects);
  const [purchaseRequests, setPRs] = useState(initPRs);
  const [invoices, setInvoices] = useState(initInvoices);
  const [inventory] = useState(initInventory);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = ++toastId;
    setToasts(t => [...t, { id, message, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4000);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts(t => t.filter(x => x.id !== id));
  }, []);

  const updateQuotationStatus = useCallback((id: string, status: QuotationStatus) => {
    setQuotations(qs => qs.map(q => q.id === id ? { ...q, status } : q));
  }, []);

  const updatePRStatus = useCallback((id: string, status: ProcurementStatus) => {
    setPRs(prs => prs.map(pr => pr.id === id ? { ...pr, status } : pr));
  }, []);

  const updateProjectStatus = useCallback((id: string, status: ProjectStatus) => {
    setProjects(ps => ps.map(p => p.id === id ? { ...p, status } : p));
  }, []);

  const toggleProjectTask = useCallback((projectId: string, taskIndex: number) => {
    setProjects(ps => ps.map(p => {
      if (p.id !== projectId) return p;
      const tasks = [...p.tasks];
      const task = tasks[taskIndex];
      tasks[taskIndex] = {
        ...task,
        status: task.status === 'Complete' ? 'Not Started' : task.status === 'In Progress' ? 'Complete' : 'In Progress',
      };
      return { ...p, tasks };
    }));
  }, []);

  const recordPayment = useCallback((invoiceId: string, amount: number, method: string, reference: string) => {
    setInvoices(invs => invs.map(inv => {
      if (inv.id !== invoiceId) return inv;
      const newPaid = inv.paid + amount;
      const newBalance = inv.amount - newPaid;
      return {
        ...inv,
        paid: newPaid,
        balance: newBalance,
        status: newBalance <= 0 ? 'Paid' : 'Partially Paid',
        payments: [...inv.payments, { date: '2026-08-30', amount, method, reference }],
      };
    }));
  }, []);

  return (
    <AppContext.Provider value={{
      requests, quotations, projects, purchaseRequests, invoices, inventory, toasts,
      updateQuotationStatus, updatePRStatus, updateProjectStatus, toggleProjectTask,
      recordPayment, addToast, removeToast,
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
