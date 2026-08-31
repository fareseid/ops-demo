import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatCurrency(amount: number): string {
  return `ZMW ${amount.toLocaleString('en-ZM', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatDateShort(date: string): string {
  return new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

export function relativeDate(date: string): string {
  const now = new Date('2026-08-30');
  const d = new Date(date);
  const diff = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  if (diff < 7) return `${diff} days ago`;
  return formatDateShort(date);
}

export function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

export const TODAY = '2026-08-31';

// Inventory status from available stock vs reorder level
export function computeInventoryStatus(available: number, reorderLevel: number): 'Available' | 'Low Stock' | 'Out of Stock' {
  if (available <= 0) return 'Out of Stock';
  if (available <= reorderLevel) return 'Low Stock';
  return 'Available';
}

// Project material status from required / available / ordered
export function computeMaterialStatus(required: number, available: number, ordered: number): 'Available' | 'Low Stock' | 'Shortage' | 'Ordered' {
  if (available >= required) return 'Available';
  if (ordered > 0) return 'Ordered';
  if (available > 0) return 'Low Stock';
  return 'Shortage';
}

// Invoice status from balance / amount / due date
export function computeInvoiceStatus(amount: number, balance: number, dueDate: string, draft = false): 'Draft' | 'Sent' | 'Partially Paid' | 'Paid' | 'Overdue' {
  if (draft) return 'Draft';
  if (balance <= 0) return 'Paid';
  if (dueDate && dueDate < TODAY) return 'Overdue';
  if (balance < amount) return 'Partially Paid';
  return 'Sent';
}
