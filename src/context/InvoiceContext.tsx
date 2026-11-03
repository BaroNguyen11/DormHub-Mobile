import { createContext, useCallback, useContext, useRef, useState } from 'react';
import type { PropsWithChildren } from 'react';
import { featuredInvoiceId, initialInvoices, initialPayments, mockPaymentDate, mockPaymentTime } from '../mocks/invoices';
import type { InvoiceDetail, Payment, PaymentMethod } from '../types/invoice';
import { applySuccessfulPayment } from '../utils/payment';
import type { ResidenceStatus } from '../types/residence';

interface InvoiceContextValue {
  invoices: readonly InvoiceDetail[];
  payments: readonly Payment[];
  payInvoice: (invoiceId: string, method: PaymentMethod) => Payment | null;
  resetForAccount: (residenceStatus: ResidenceStatus) => void;
}
const InvoiceContext = createContext<InvoiceContextValue | null>(null);

export function InvoiceProvider({ children }: PropsWithChildren) {
  const [invoices, setInvoices] = useState<readonly InvoiceDetail[]>(initialInvoices);
  const [payments, setPayments] = useState<readonly Payment[]>(initialPayments);
  const invoicesRef = useRef(invoices);
  const paymentsRef = useRef(payments);

  const resetForAccount = useCallback((residenceStatus: ResidenceStatus) => {
    const nextInvoices = residenceStatus === 'active' ? initialInvoices.map((item) => ({ ...item, lineItems: item.lineItems.map((line) => ({ ...line })) })) : [];
    const nextPayments = residenceStatus === 'active' ? initialPayments.map((item) => ({ ...item })) : [];
    invoicesRef.current = nextInvoices;
    paymentsRef.current = nextPayments;
    setInvoices(nextInvoices);
    setPayments(nextPayments);
  }, []);

  const payInvoice = useCallback((invoiceId: string, method: PaymentMethod): Payment | null => {
    const id = invoiceId === featuredInvoiceId ? 'TX92038475' : `MOCK-TX-${paymentsRef.current.length + 1}`;
    const result = applySuccessfulPayment(invoicesRef.current, paymentsRef.current, invoiceId, method, id, mockPaymentDate, mockPaymentTime);
    if (!result) return null;
    invoicesRef.current = result.invoices;
    paymentsRef.current = result.payments;
    setInvoices(result.invoices);
    setPayments(result.payments);
    return result.payment;
  }, []);
  return <InvoiceContext.Provider value={{ invoices, payments, payInvoice, resetForAccount }}>{children}</InvoiceContext.Provider>;
}

export function useInvoices() { const value = useContext(InvoiceContext); if (!value) throw new Error('InvoiceProvider is missing'); return value; }
