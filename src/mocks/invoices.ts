import type { InvoiceDetail, InvoiceLineItem, Payment } from '../types/invoice';
import { createInvoice } from '../utils/invoice';

// Fixed Figma preview date. Overdue is derived from dueDate against this mock day.
export const mockTodayIso = '2026-09-11';
export const featuredInvoiceId = 'INV-2026-09-A203';
export const mockPaymentDate = '11/09/2026';
export const mockPaymentTime = '10:42';
// Deterministic preview: the July invoice fails on its first attempt, then succeeds on retry.
// This models a local test result, not a payment gateway response.
export function mockPaymentSucceeds(invoiceId: string, attempt: number): boolean {
  return invoiceId !== 'INV-2026-07-A203' || attempt > 1;
}

function items(room: number, electricity: number, water: number, service: number, kwh?: number, m3?: number): readonly InvoiceLineItem[] {
  return [
    { id: 'room', label: 'Tiền phòng', amount: room },
    { id: 'electricity', label: kwh ? `Tiền điện (${kwh} kWh)` : 'Tiền điện', amount: electricity },
    { id: 'water', label: m3 ? `Tiền nước (${m3} m³)` : 'Tiền nước', amount: water },
    { id: 'service', label: 'Phí dịch vụ', amount: service },
  ];
}

export const initialInvoices: readonly InvoiceDetail[] = [
  createInvoice({ id: featuredInvoiceId, kind: 'ROOM', period: '2026-09', title: 'Hóa đơn tháng 9', dueDate: '2026-09-15', status: 'UNPAID', roomId: 'A203', lineItems: items(1100000, 150000, 40000, 10000, 125, 4) }),
  createInvoice({ id: 'INV-2026-08-A203', kind: 'ROOM', period: '2026-08', title: 'Hóa đơn tháng 8', dueDate: '2026-08-15', status: 'PAID', paidAt: '05/08/2026', roomId: 'A203', lineItems: items(1100000, 125000, 40000, 10000) }),
  createInvoice({ id: 'INV-2026-07-A203', kind: 'ROOM', period: '2026-07', title: 'Hóa đơn tháng 7', dueDate: '2026-08-30', status: 'UNPAID', roomId: 'A203', lineItems: items(1100000, 160000, 40000, 10000) }),
  createInvoice({ id: 'INV-2026-06-A203', kind: 'ROOM', period: '2026-06', title: 'Hóa đơn tháng 6', dueDate: '2026-06-15', status: 'PAID', paidAt: '03/06/2026', roomId: 'A203', lineItems: items(1100000, 100000, 40000, 10000) }),
];

export const initialPayments: readonly Payment[] = [
  { id: 'TX92038201', invoiceId: 'INV-2026-08-A203', invoiceTitle: 'Hóa đơn tháng 8', amount: 1275000, method: 'VNPAY', status: 'SUCCESS', date: '05/08/2026' },
  { id: 'TX91987744', invoiceId: 'INV-2026-06-A203', invoiceTitle: 'Hóa đơn tháng 6', amount: 1250000, method: 'SEPAY', status: 'SUCCESS', date: '03/06/2026' },
  { id: 'MOCK-FAILED-2026-05', invoiceId: 'INV-2026-05-A203', invoiceTitle: 'Hóa đơn tháng 5', amount: 1240000, method: 'VNPAY', status: 'FAILED', date: '02/05/2026' },
  { id: 'TX91765310', invoiceId: 'INV-2026-04-A203', invoiceTitle: 'Hóa đơn tháng 4', amount: 1240000, method: 'VNPAY', status: 'SUCCESS', date: '04/04/2026' },
];
