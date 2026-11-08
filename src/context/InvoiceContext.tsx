import { createContext, useCallback, useContext, useRef, useState } from 'react';
import type { PropsWithChildren } from 'react';
import { featuredInvoiceId, initialInvoices, initialPayments, mockPaymentDate, mockPaymentSucceeds, mockPaymentTime } from '../mocks/invoices';
import type { InvoiceDetail, Payment, PaymentMethod } from '../types/invoice';
import { applyFailedMockPayment, applySuccessfulPayment } from '../utils/payment';
import { sumLineItems } from '../utils/invoice';
import type { ResidenceStatus } from '../types/residence';

type MockPaymentResult = { kind: 'success'; payment: Payment } | { kind: 'failed' } | { kind: 'invalid' };
interface InvoiceContextValue {
  invoices: readonly InvoiceDetail[];
  payments: readonly Payment[];
  payInvoice: (invoiceId: string, method: PaymentMethod) => MockPaymentResult;
  resetForAccount: (residenceStatus: ResidenceStatus) => void;
}
const InvoiceContext = createContext<InvoiceContextValue | null>(null);

export function InvoiceProvider({ children }: PropsWithChildren) {
  const [invoices, setInvoices] = useState<readonly InvoiceDetail[]>(initialInvoices);
  const [payments, setPayments] = useState<readonly Payment[]>(initialPayments);
  const invoicesRef = useRef(invoices);
  const paymentsRef = useRef(payments);
  const attemptsRef = useRef<Record<string, number>>({});

  const resetForAccount = useCallback((residenceStatus: ResidenceStatus) => {
    const nextInvoices = residenceStatus === 'active' ? initialInvoices.map((item) => ({ ...item, lineItems: item.lineItems.map((line) => ({ ...line })) })) : [];
    const nextPayments = residenceStatus === 'active' ? initialPayments.map((item) => ({ ...item })) : [];
    invoicesRef.current = nextInvoices;
    paymentsRef.current = nextPayments;
    attemptsRef.current = {};
    setInvoices(nextInvoices);
    setPayments(nextPayments);
  }, []);

  const payInvoice = useCallback((invoiceId: string, method: PaymentMethod): MockPaymentResult => {
    const invoice = invoicesRef.current.find((item) => item.id === invoiceId);
    if (!invoice || invoice.status !== 'UNPAID' || invoice.totalAmount !== sumLineItems(invoice.lineItems)) return { kind: 'invalid' };
    const attempt = (attemptsRef.current[invoiceId] ?? 0) + 1;
    attemptsRef.current[invoiceId] = attempt;
    if (!mockPaymentSucceeds(invoiceId, attempt)) {
      const failure = applyFailedMockPayment(invoicesRef.current, paymentsRef.current, invoiceId, method, `MOCK-FAILED-${invoiceId}-${attempt}`, mockPaymentDate, mockPaymentTime);
      if (!failure) return { kind: 'invalid' };
      paymentsRef.current = failure.payments;
      setPayments(paymentsRef.current);
      return { kind: 'failed' };
    }
    const id = invoiceId === featuredInvoiceId ? 'TX92038475' : `MOCK-TX-${paymentsRef.current.length + 1}`;
    const result = applySuccessfulPayment(invoicesRef.current, paymentsRef.current, invoiceId, method, id, mockPaymentDate, mockPaymentTime);
    if (!result) return { kind: 'invalid' };
    invoicesRef.current = result.invoices;
    paymentsRef.current = result.payments;
    setInvoices(result.invoices);
    setPayments(result.payments);
    return { kind: 'success', payment: result.payment };
  }, []);
  return <InvoiceContext.Provider value={{ invoices, payments, payInvoice, resetForAccount }}>{children}</InvoiceContext.Provider>;
}

export function useInvoices() { const value = useContext(InvoiceContext); if (!value) throw new Error('InvoiceProvider is missing'); return value; }
