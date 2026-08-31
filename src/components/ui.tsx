import { cn, getInitials } from '@/lib/utils';
import { X, AlertTriangle } from 'lucide-react';

// Status Badge
const statusColors: Record<string, string> = {
  // Request
  'New': 'bg-blue-50 text-blue-700 border-blue-200',
  'Reviewing': 'bg-amber-50 text-amber-700 border-amber-200',
  'Site Visit Required': 'bg-purple-50 text-purple-700 border-purple-200',
  'Ready to Quote': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Quoted': 'bg-steel-100 text-steel-700 border-steel-200',
  // Quotation
  'Draft': 'bg-steel-100 text-steel-600 border-steel-200',
  'Internal Review': 'bg-amber-50 text-amber-700 border-amber-200',
  'Sent': 'bg-blue-50 text-blue-700 border-blue-200',
  'Customer Reviewing': 'bg-amber-50 text-amber-700 border-amber-200',
  'Accepted': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Rejected': 'bg-red-50 text-red-700 border-red-200',
  'Expired': 'bg-steel-100 text-steel-500 border-steel-200',
  // Project
  'Planning': 'bg-blue-50 text-blue-700 border-blue-200',
  'Awaiting Materials': 'bg-amber-50 text-amber-700 border-amber-200',
  'In Progress': 'bg-copper-50 text-copper-700 border-copper-200',
  'On Hold': 'bg-red-50 text-red-600 border-red-200',
  'Completed': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  // Procurement
  'Approval Required': 'bg-amber-50 text-amber-700 border-amber-200',
  'Approved': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'PO Issued': 'bg-blue-50 text-blue-700 border-blue-200',
  'Partially Received': 'bg-purple-50 text-purple-700 border-purple-200',
  'Received': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  // Invoice
  'Partially Paid': 'bg-amber-50 text-amber-700 border-amber-200',
  'Paid': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Overdue': 'bg-red-50 text-red-700 border-red-200',
  // Inventory
  'Available': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Low Stock': 'bg-amber-50 text-amber-700 border-amber-200',
  'Shortage': 'bg-red-50 text-red-700 border-red-200',
  'Out of Stock': 'bg-red-50 text-red-700 border-red-200',
  'Ordered': 'bg-blue-50 text-blue-700 border-blue-200',
  'Pending': 'bg-steel-100 text-steel-600 border-steel-200',
  // Priority
  'Urgent': 'bg-red-50 text-red-700 border-red-200',
  'High': 'bg-amber-50 text-amber-700 border-amber-200',
  'Medium': 'bg-blue-50 text-blue-700 border-blue-200',
  'Normal': 'bg-steel-50 text-steel-600 border-steel-200',
  'Low': 'bg-steel-50 text-steel-500 border-steel-200',
  // Tasks
  'Complete': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Not Started': 'bg-steel-50 text-steel-500 border-steel-200',
  // Equipment
  'In Use': 'bg-blue-50 text-blue-700 border-blue-200',
  'Maintenance': 'bg-amber-50 text-amber-700 border-amber-200',
  'Maintenance Required': 'bg-red-50 text-red-600 border-red-200',
  'Good': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Fair': 'bg-amber-50 text-amber-700 border-amber-200',
  // Labour
  'Assigned': 'bg-blue-50 text-blue-700 border-blue-200',
  'On Leave': 'bg-steel-100 text-steel-500 border-steel-200',
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const color = statusColors[status] || 'bg-steel-50 text-steel-600 border-steel-200';
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-md border', color, className)}>
      {status}
    </span>
  );
}

// KPI Card
export function KPICard({ label, value, sub, icon }: { label: string; value: string | number; sub?: string; icon?: React.ReactNode }) {
  return (
    <div className="bg-white rounded-lg border border-steel-200 p-3 sm:p-5 hover:border-steel-300 transition-colors">
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-xs sm:text-sm text-steel-500 font-medium truncate">{label}</p>
          <p className="text-lg sm:text-2xl font-semibold text-navy-900 mt-0.5 sm:mt-1 truncate">{value}</p>
          {sub && <p className="text-xs text-steel-400 mt-1">{sub}</p>}
        </div>
        {icon && <div className="text-steel-400 hidden sm:block">{icon}</div>}
      </div>
    </div>
  );
}

// Avatar
export function Avatar({ name, size = 'sm' }: { name: string; size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'w-7 h-7 text-xs', md: 'w-9 h-9 text-sm', lg: 'w-11 h-11 text-base' };
  return (
    <div className={cn('rounded-full bg-navy-100 text-navy-700 font-medium flex items-center justify-center flex-shrink-0', sizes[size])}>
      {getInitials(name)}
    </div>
  );
}

// Page Header
export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-5 sm:mb-6">
      <div>
        <h1 className="text-lg sm:text-xl font-semibold text-navy-900">{title}</h1>
        {subtitle && <p className="text-xs sm:text-sm text-steel-500 mt-0.5">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

// Button
export function Button({ children, variant = 'primary', size = 'md', onClick, className, disabled }: {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md';
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}) {
  const variants = {
    primary: 'bg-navy-800 text-white hover:bg-navy-900 shadow-sm',
    secondary: 'bg-white text-navy-800 border border-steel-200 hover:bg-steel-50 shadow-sm',
    ghost: 'text-steel-600 hover:bg-steel-100',
    danger: 'bg-red-600 text-white hover:bg-red-700 shadow-sm',
  };
  const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2 text-sm' };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn('inline-flex items-center gap-1.5 font-medium rounded-lg transition-colors disabled:opacity-50', variants[variant], sizes[size], className)}
    >
      {children}
    </button>
  );
}

// Modal
export function Modal({ open, onClose, title, children, width = 'max-w-lg' }: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  width?: string;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className={cn('relative bg-white w-full shadow-2xl rounded-t-xl sm:rounded-xl max-h-[90vh] sm:max-h-[85vh] flex flex-col', width)}>
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-steel-200 flex-shrink-0">
          <h2 className="text-sm sm:text-base font-semibold text-navy-900">{title}</h2>
          <button onClick={onClose} className="text-steel-400 hover:text-steel-600 p-1 rounded-lg hover:bg-steel-100">
            <X size={18} />
          </button>
        </div>
        <div className="px-4 sm:px-6 py-4 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

// Toast Container
export function ToastContainer({ toasts, onRemove }: { toasts: { id: number; message: string; type: string }[]; onRemove: (id: number) => void }) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map(t => (
        <div key={t.id} className={cn(
          'toast-enter flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-sm font-medium min-w-[280px]',
          t.type === 'success' && 'bg-emerald-600 text-white',
          t.type === 'error' && 'bg-red-600 text-white',
          t.type === 'info' && 'bg-navy-800 text-white',
        )}>
          <span className="flex-1">{t.message}</span>
          <button onClick={() => onRemove(t.id)} className="opacity-70 hover:opacity-100"><X size={14} /></button>
        </div>
      ))}
    </div>
  );
}

// Empty State
export function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-12 text-steel-400">
      <p className="text-sm">{message}</p>
    </div>
  );
}

// Progress Bar
export function ProgressBar({ value, className }: { value: number; className?: string }) {
  return (
    <div className={cn('w-full bg-steel-100 rounded-full h-2', className)}>
      <div
        className={cn('h-2 rounded-full transition-all', value >= 75 ? 'bg-emerald-500' : value >= 40 ? 'bg-copper-500' : 'bg-blue-500')}
        style={{ width: `${Math.min(value, 100)}%` }}
      />
    </div>
  );
}

// Tabs
export function Tabs({ tabs, active, onChange }: { tabs: string[]; active: string; onChange: (t: string) => void }) {
  return (
    <div className="flex border-b border-steel-200 gap-0 overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
      {tabs.map(t => (
        <button
          key={t}
          onClick={() => onChange(t)}
          className={cn(
            'px-3 sm:px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap',
            active === t ? 'border-navy-800 text-navy-900' : 'border-transparent text-steel-500 hover:text-steel-700 hover:border-steel-300'
          )}
        >
          {t}
        </button>
      ))}
    </div>
  );
}

// Search Input
export function SearchInput({ value, onChange, placeholder = 'Search...' }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <input
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full sm:w-64 px-3 py-2 text-sm border border-steel-200 rounded-lg bg-white placeholder-steel-400 focus:outline-none focus:ring-2 focus:ring-navy-200 focus:border-navy-400"
    />
  );
}

// Select Filter
export function SelectFilter({ value, onChange, options, placeholder }: { value: string; onChange: (v: string) => void; options: string[]; placeholder: string }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="px-3 py-2 text-sm border border-steel-200 rounded-lg bg-white text-steel-700 focus:outline-none focus:ring-2 focus:ring-navy-200"
    >
      <option value="">{placeholder}</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

// ========== FORM PRIMITIVES ==========

export const inputClass = 'w-full px-3 py-2.5 text-sm border border-steel-200 rounded-lg bg-white text-navy-900 placeholder-steel-400 focus:outline-none focus:ring-2 focus:ring-navy-200 focus:border-navy-400 disabled:bg-steel-50 disabled:text-steel-400';

// Field wrapper with label / required marker / error / hint
export function FormField({ label, required, error, hint, children, className }: {
  label?: string; required?: boolean; error?: string; hint?: string; children: React.ReactNode; className?: string;
}) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-xs font-semibold text-steel-600 mb-1.5">
          {label}{required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      {children}
      {error ? (
        <p className="text-xs text-red-600 mt-1">{error}</p>
      ) : hint ? (
        <p className="text-xs text-steel-400 mt-1">{hint}</p>
      ) : null}
    </div>
  );
}

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean };
export function Input({ invalid, className, ...props }: InputProps) {
  return <input {...props} className={cn(inputClass, invalid && 'border-red-300 focus:ring-red-200', className)} />;
}

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean };
export function Textarea({ invalid, className, rows = 3, ...props }: TextareaProps) {
  return <textarea rows={rows} {...props} className={cn(inputClass, 'resize-y', invalid && 'border-red-300 focus:ring-red-200', className)} />;
}

type Opt = string | { value: string; label: string };
export function FormSelect({ value, onChange, options, placeholder, invalid, disabled, className }: {
  value: string; onChange: (v: string) => void; options: Opt[]; placeholder?: string; invalid?: boolean; disabled?: boolean; className?: string;
}) {
  return (
    <select
      value={value}
      disabled={disabled}
      onChange={e => onChange(e.target.value)}
      className={cn(inputClass, 'appearance-none bg-no-repeat', invalid && 'border-red-300 focus:ring-red-200', !value && placeholder && 'text-steel-400', className)}
      style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23687591' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")", backgroundPosition: 'right 0.65rem center', paddingRight: '2rem' }}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(o => {
        const val = typeof o === 'string' ? o : o.value;
        const label = typeof o === 'string' ? o : o.label;
        return <option key={val} value={val}>{label}</option>;
      })}
    </select>
  );
}

// Sticky footer action bar for forms (mobile-friendly)
export function FormActions({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-end gap-2 pt-4 mt-2 border-t border-steel-100 sticky bottom-0 bg-white pb-1">
      {children}
    </div>
  );
}

// Confirmation dialog (always centered)
export function ConfirmDialog({ open, title, message, confirmLabel = 'Delete', cancelLabel = 'Cancel', danger = true, onConfirm, onCancel }: {
  open: boolean; title: string; message: string; confirmLabel?: string; cancelLabel?: string; danger?: boolean;
  onConfirm: () => void; onCancel: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative bg-white w-full max-w-sm rounded-xl shadow-2xl p-5">
        <div className="flex gap-3">
          {danger && (
            <div className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
              <AlertTriangle size={18} className="text-red-600" />
            </div>
          )}
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-navy-900">{title}</h3>
            <p className="text-sm text-steel-500 mt-1">{message}</p>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-5">
          <Button variant="secondary" size="sm" onClick={onCancel}>{cancelLabel}</Button>
          <Button variant={danger ? 'danger' : 'primary'} size="sm" onClick={onConfirm}>{confirmLabel}</Button>
        </div>
      </div>
    </div>
  );
}
