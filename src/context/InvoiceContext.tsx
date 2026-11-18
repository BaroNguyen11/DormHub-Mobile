import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { PropsWithChildren } from 'react';
import { getInvoice, initiateInvoicePayment, listInvoices, listPayments } from '../api/student';
import type { InvoiceDto, PaymentHistoryDto, PaymentDto } from '../api/student';
import { ApiError } from '../api/httpClient';
import { useAuth } from './AuthContext';
import type { InvoiceDetail, Payment, PaymentMethod } from '../types/invoice';

type StartPaymentResult = { kind: 'started'; payment: PaymentDto } | { kind: 'failed' } | { kind: 'invalid' };
interface InvoiceContextValue {
  invoices: readonly InvoiceDetail[];
  payments: readonly Payment[];
  loading: boolean;
  error: string | null;
  refreshInvoices: () => Promise<void>;
  fetchInvoice: (id: string) => Promise<InvoiceDetail>;
  payInvoice: (invoiceId: string, method: PaymentMethod) => Promise<StartPaymentResult>;
}
const InvoiceContext = createContext<InvoiceContextValue | null>(null);

const amount = (value: number | string | null | undefined) => Number(value ?? 0);
const dateOnly = (value: string | null | undefined) => value ? value.slice(0, 10) : '';
function invoiceFromDto(dto: InvoiceDto): InvoiceDetail {
  const period = dto.billingMonth ?? '';
  const kind = dto.invoiceType === 'DEPOSIT' ? 'DEPOSIT' : 'ROOM';
  return {
    id: String(dto.invoiceId), kind, period, title: kind === 'DEPOSIT' ? 'Hóa đơn tiền cọc' : `Hóa đơn ${period}`,
    dueDate: dateOnly(dto.dueDate), status: dto.status,
    lineItems: (dto.details ?? []).map((item) => ({ id: String(item.detailId), label: item.description, amount: amount(item.amount) })),
    totalAmount: amount(dto.totalAmount), roomId: String(dto.roomId),
  };
}
function paymentFromDto(dto: PaymentHistoryDto): Payment {
  return {
    id: String(dto.paymentId), invoiceId: String(dto.invoiceId), invoiceTitle: dto.invoiceType === 'DEPOSIT' ? 'Hóa đơn tiền cọc' : `Hóa đơn ${dto.invoiceId}`,
    amount: amount(dto.expectedAmount), method: 'SEPAY', status: dto.paymentStatus === 'SUCCESS' ? 'SUCCESS' : dto.paymentStatus === 'FAILED' || dto.paymentStatus === 'EXPIRED' ? 'FAILED' : 'PENDING',
    date: dto.paidAt ?? dto.createdAt,
  };
}

export function InvoiceProvider({ children }: PropsWithChildren) {
  const auth = useAuth();
  const [invoices, setInvoices] = useState<readonly InvoiceDetail[]>([]);
  const [payments, setPayments] = useState<readonly Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const refreshInvoices = useCallback(async () => {
    if (auth.status !== 'authenticated') { setInvoices([]); setPayments([]); setError(null); setLoading(false); return; }
    setLoading(true);
    setError(null);
    try {
      const [invoiceResult, paymentResult] = await Promise.all([listInvoices(), listPayments()]);
      setInvoices(invoiceResult.data.content.map(invoiceFromDto));
      setPayments(paymentResult.data.content.map(paymentFromDto));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Không tải được hóa đơn và lịch sử thanh toán.');
      throw cause;
    } finally { setLoading(false); }
  }, [auth.status, auth.status === 'authenticated' ? auth.user.userId : null]);
  useEffect(() => { void refreshInvoices().catch(() => undefined); }, [refreshInvoices]);
  const fetchInvoice = useCallback(async (id: string) => invoiceFromDto((await getInvoice(id)).data), []);
  const payInvoice = useCallback(async (invoiceId: string, _method: PaymentMethod): Promise<StartPaymentResult> => {
    try { return { kind: 'started', payment: (await initiateInvoicePayment(invoiceId)).data }; }
    catch (cause) {
      if (cause instanceof ApiError && (cause.code === 'INVOICE_NOT_PAYABLE' || cause.code === 'INVOICE_ALREADY_PAID' || cause.code === 'INVOICE_CANCELLED')) return { kind: 'invalid' };
      throw cause;
    }
  }, []);
  return <InvoiceContext.Provider value={{ invoices, payments, loading, error, refreshInvoices, fetchInvoice, payInvoice }}>{children}</InvoiceContext.Provider>;
}

export function useInvoices() { const value = useContext(InvoiceContext); if (!value) throw new Error('InvoiceProvider is missing'); return value; }
