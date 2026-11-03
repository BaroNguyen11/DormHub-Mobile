import type { InvoiceDetail, Payment, PaymentMethod } from '../types/invoice';
import { sumLineItems } from './invoice';

export interface PaymentTransition { invoices: readonly InvoiceDetail[]; payments: readonly Payment[]; payment: Payment }
export function applySuccessfulPayment(
  invoices: readonly InvoiceDetail[], payments: readonly Payment[],
  invoiceId: string, method: PaymentMethod, transactionId: string, date: string, time: string,
): PaymentTransition | null {
  const invoice = invoices.find((item) => item.id === invoiceId);
  if (!invoice || invoice.status !== 'UNPAID' || invoice.totalAmount !== sumLineItems(invoice.lineItems)) return null;
  const payment: Payment = { id: transactionId, invoiceId, invoiceTitle: invoice.title, amount: invoice.totalAmount, method, status: 'SUCCESS', date, time };
  return {
    invoices: invoices.map((item) => item.id === invoiceId ? { ...item, status: 'PAID' as const, paidAt: date } : item),
    payments: [payment, ...payments], payment,
  };
}
