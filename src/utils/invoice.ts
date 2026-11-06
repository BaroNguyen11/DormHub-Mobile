import type { InvoiceDetail, InvoiceLineItem } from '../types/invoice';

export function sumLineItems(items: readonly InvoiceLineItem[]): number { return items.reduce((total, item) => total + item.amount, 0); }
export function createInvoice(input: Omit<InvoiceDetail, 'totalAmount'>): InvoiceDetail {
  if (input.lineItems.some((item) => !Number.isInteger(item.amount) || item.amount < 0)) throw new Error('Invalid mock invoice line item');
  return { ...input, totalAmount: sumLineItems(input.lineItems) };
}
export function daysOverdue(invoice: InvoiceDetail, todayIso: string): number {
  if (invoice.status !== 'UNPAID') return 0;
  const due = Date.parse(`${invoice.dueDate}T00:00:00Z`);
  const today = Date.parse(`${todayIso}T00:00:00Z`);
  return Math.max(0, Math.floor((today - due) / 86400000));
}
export function formatVnd(amount: number): string { return `${amount.toLocaleString('vi-VN')}đ`; }
export function formatIsoDate(iso: string): string { const [year, month, day] = iso.split('-'); return `${day}/${month}/${year}`; }
