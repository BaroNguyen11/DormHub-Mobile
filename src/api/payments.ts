import { apiClient, getApiErrorMessage } from './client';

interface ApiEnvelope<T> {
  code: string;
  message: string;
  data: T;
}

interface CsrfData {
  token: string;
}

export type BackendInvoiceType = 'ROOM_FEE' | 'UTILITY' | 'DEPOSIT';
export type BackendPaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'EXPIRED';

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
  vietQrUrl: string;
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
    throw new Error(response.message || 'Could not create payment transaction.');
  }
  return response.data;
}

/** Creates or reuses the pending VietQR transaction for an owned invoice. */
export async function createInvoicePayment(invoiceId: number): Promise<InvoicePaymentTransaction> {
  try {
    const csrfToken = await getCsrfToken();
    const response = await apiClient.post<ApiEnvelope<InvoicePaymentTransaction>>(
      `/student/invoices/${invoiceId}/payments`,
      undefined,
      { headers: { 'X-XSRF-TOKEN': csrfToken } },
    );
    return unwrapTransaction(response.data);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Could not create payment transaction.'));
  }
}
