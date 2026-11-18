// UI models mapped from the invoice and payment APIs.
export type InvoiceStatus = 'UNPAID' | 'PAID' | 'CANCELLED';
export type InvoiceKind = 'ROOM' | 'DEPOSIT';
export type PaymentMethod = 'VNPAY' | 'SEPAY';
export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED';

export interface InvoiceLineItem { id: string; label: string; amount: number }
export interface Invoice {
  id: string;
  kind: InvoiceKind;
  period: string;
  title: string;
  dueDate: string; // YYYY-MM-DD.
  status: InvoiceStatus;
  lineItems: readonly InvoiceLineItem[];
  totalAmount: number;
  paidAt?: string; // DD/MM/YYYY for the PDF snapshot.
}
export interface InvoiceDetail extends Invoice { roomId: string }
export interface Payment {
  id: string;
  invoiceId: string;
  invoiceTitle: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  date: string;
  time?: string;
}
