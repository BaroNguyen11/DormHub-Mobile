import axios from 'axios';
import { apiClient, getApiErrorMessage } from './client';

interface ApiEnvelope<T> {
  code: string;
  message: string;
  data: T;
}

interface CsrfData {
  token: string;
}

function paymentErrorMessage(error: unknown): string {
  if (axios.isAxiosError<ApiEnvelope<unknown>>(error)) {
    const code = error.response?.data?.code;
    if (code === 'PAYMENT_CONFLICT') return 'Trạng thái hóa đơn hoặc giao dịch đã thay đổi. Vui lòng kiểm tra lại.';
    if (code === 'PAYMENT_NOT_SUPPORTED') return 'Hóa đơn này hiện chưa thể thanh toán.';
    if (code === 'PAYMENT_INVALID_AMOUNT') return 'Số tiền hóa đơn chưa hợp lệ để thanh toán.';
    if (code === 'PAYMENT_CONFIGURATION_ERROR') return 'Thanh toán tạm thời chưa thể sử dụng. Vui lòng thử lại sau.';
    if (code === 'BILLING_NOT_FOUND' || code === 'PAYMENT_NOT_FOUND') return 'Không tìm thấy hóa đơn hoặc giao dịch này.';
    if (error.response?.status === 409) return 'Trạng thái hóa đơn hoặc giao dịch đã thay đổi. Vui lòng kiểm tra lại.';
  }
  return getApiErrorMessage(error, 'Không thể xử lý giao dịch. Vui lòng thử lại.');
}

export type BackendInvoiceType = 'ROOM_FEE' | 'UTILITY' | 'DEPOSIT';
export type BackendPaymentStatus = 'PENDING' | 'SUCCESS' | 'EXPIRED' | 'CANCELLED';

export interface InvoicePaymentTransaction {
  paymentId: number;
  invoiceId: number;
  invoiceType: BackendInvoiceType;
  paymentStatus: BackendPaymentStatus;
  invoiceStatus: 'UNPAID' | 'PAID' | 'CANCELLED';
  expectedAmount: number;
  currency: 'VND';
  paymentReference: string;
  receivingBankCode: string;
  receivingAccountNumber: string;
  vietQrUrl: string | null;
  createdAt: string;
  expiresAt: string;
  expired: boolean;
}

async function getCsrfToken(): Promise<string> {
  const response = await apiClient.get<ApiEnvelope<CsrfData>>('/auth/csrf');
  const token = response.data.data?.token;
  if (!token) throw new Error('Backend did not return a CSRF token.');
  return token;
}

function unwrapTransaction(response: ApiEnvelope<InvoicePaymentTransaction>): InvoicePaymentTransaction {
  if (response.code !== 'SUCCESS' || !response.data) {
    throw new Error('Không thể tải giao dịch. Vui lòng thử lại.');
  }
  return response.data;
}

/** Creates or reuses the pending VietQR transaction for an owned invoice. */
export async function createInvoicePayment(invoiceId: number): Promise<InvoicePaymentTransaction> {
  if (!Number.isSafeInteger(invoiceId) || invoiceId <= 0) throw new Error('Không tìm thấy hóa đơn.');
  try {
    const csrfToken = await getCsrfToken();
    const response = await apiClient.post<ApiEnvelope<InvoicePaymentTransaction>>(
      `/student/invoices/${invoiceId}/payments`,
      undefined,
      { headers: { 'X-XSRF-TOKEN': csrfToken } },
    );
    return unwrapTransaction(response.data);
  } catch (error) {
    throw new Error(paymentErrorMessage(error));
  }
}

export async function getStudentPayment(paymentId: number): Promise<InvoicePaymentTransaction> {
  if (!Number.isSafeInteger(paymentId) || paymentId <= 0) throw new Error('Không tìm thấy giao dịch.');
  try {
    const response = await apiClient.get<ApiEnvelope<InvoicePaymentTransaction>>(`/student/payments/${paymentId}`);
    return unwrapTransaction(response.data);
  } catch (error) {
    throw new Error(paymentErrorMessage(error));
  }
}
