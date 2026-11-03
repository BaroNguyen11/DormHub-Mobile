// Frontend mock view models, not Spring Boot DTOs.
export type InvoiceStatus = 'UNPAID' | 'PAID' | 'CANCELLED';
export type InvoiceKind = 'ROOM';
export type PaymentMethod = 'VNPAY' | 'SEPAY';
export type PaymentStatus = 'SUCCESS' | 'FAILED';

export interface InvoiceLineItem { id: string; label: string; amount: number }
export interface Invoice {
  id: string;
  kind: InvoiceKind;
  period: string;
  title: string;
  dueDate: string; // YYYY-MM-DD, mock calendar day.
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
