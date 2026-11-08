import { apiClient, getApiErrorMessage } from './client';

interface ApiResponse<T> { code: string; message: string; data: T }
export type StudentInvoiceStatus = 'UNPAID' | 'PAID' | 'CANCELLED';
export type StudentInvoiceType = 'UTILITY' | 'ROOM_FEE' | 'DEPOSIT';
export type InvoiceItemType = 'ELECTRICITY' | 'WATER' | 'ROOM' | 'DEPOSIT' | string;

export interface StudentInvoiceSummary {
  invoiceId: number;
  invoiceType: StudentInvoiceType;
  roomId: number | null;
  contractId: number | null;
  billingMonth: string | null;
  issueDate: string;
  dueDate: string | null;
  status: StudentInvoiceStatus;
  overdue: boolean;
  totalAmount: number;
}
export interface StudentInvoiceDetail extends StudentInvoiceSummary {
  details: Array<{
    detailId: number;
    itemType: InvoiceItemType;
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
  }>;
}
export interface StudentInvoicePage {
  content: StudentInvoiceSummary[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

function unwrap<T>(response: ApiResponse<T>): T {
  if (response.code !== 'SUCCESS' || response.data == null) throw new Error('Không thể tải hóa đơn. Vui lòng thử lại.');
  return response.data;
}

export async function getStudentInvoices(page = 0, size = 20, status?: 'UNPAID' | 'PAID'): Promise<StudentInvoicePage> {
  try {
    const response = await apiClient.get<ApiResponse<StudentInvoicePage>>('/student/invoices', { params: { page, size, ...(status ? { status } : {}) } });
    return unwrap(response.data);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Không thể tải hóa đơn. Vui lòng thử lại.'));
  }
}

export async function getStudentInvoice(invoiceId: number): Promise<StudentInvoiceDetail> {
  if (!Number.isSafeInteger(invoiceId) || invoiceId <= 0) throw new Error('Không tìm thấy hóa đơn.');
  try {
    const response = await apiClient.get<ApiResponse<StudentInvoiceDetail>>(`/student/invoices/${invoiceId}`);
    return unwrap(response.data);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Không thể tải chi tiết hóa đơn. Vui lòng thử lại.'));
  }
}
