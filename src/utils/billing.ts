import type { StudentInvoiceStatus, StudentInvoiceType } from '../api/invoices';

export const invoiceTypeLabels: Record<StudentInvoiceType, string> = {
  ROOM_FEE: 'Tiền phòng', UTILITY: 'Điện nước', DEPOSIT: 'Tiền cọc',
};
export const invoiceStatusLabels: Record<StudentInvoiceStatus, string> = {
  UNPAID: 'Chưa thanh toán', PAID: 'Đã thanh toán', CANCELLED: 'Đã hủy',
};

export function formatMoney(amount: number): string {
  return `${new Intl.NumberFormat('vi-VN').format(amount)} đ`;
}

export function formatLocalDate(value: string | null): string {
  if (!value) return 'Chưa có';
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  return match ? `${match[3]}/${match[2]}/${match[1]}` : value;
}

export function formatBillingMonth(value: string | null): string {
  if (!value) return 'Không áp dụng';
  const match = /^(\d{4})-(\d{2})/.exec(value);
  return match ? `${match[2]}/${match[1]}` : value;
}
