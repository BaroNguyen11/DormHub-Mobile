import { apiRequest } from './httpClient';

export interface InvoiceLineDto { detailId: number; itemType: string; description: string; quantity: number | string; unitPrice: number | string; amount: number | string }
export interface InvoiceDto {
  invoiceId: number; invoiceType: string; roomId: number; contractId: number; billingMonth: string;
  issueDate: string; dueDate: string; status: 'UNPAID' | 'PAID' | 'CANCELLED'; overdue: boolean;
  totalAmount: number | string; details?: InvoiceLineDto[]; studentName?: string; roomNumber?: string; buildingName?: string;
}
export interface PageDto<T> { content: T[]; page?: number; number?: number; size: number; totalElements: number; totalPages: number }
export interface PaymentDto {
  paymentId: number; invoiceId: number; invoiceType: string; paymentStatus: 'PENDING' | 'SUCCESS' | 'FAILED' | 'EXPIRED';
  invoiceStatus: 'UNPAID' | 'PAID' | 'CANCELLED'; expectedAmount: number | string; currency: string;
  paymentReference: string; receivingBankCode: string; receivingAccountNumber: string; vietQrUrl: string;
  createdAt: string; expiresAt: string; paidAt: string | null; expired: boolean;
}
export interface PaymentHistoryDto extends Omit<PaymentDto, 'receivingBankCode' | 'receivingAccountNumber' | 'vietQrUrl'> {}

export function listInvoices(page = 0, size = 100) { return apiRequest<PageDto<InvoiceDto>>(`/api/v1/student/invoices?page=${page}&size=${size}`); }
export function getInvoice(invoiceId: string) { return apiRequest<InvoiceDto>(`/api/v1/student/invoices/${encodeURIComponent(invoiceId)}`); }
export function initiateInvoicePayment(invoiceId: string) { return apiRequest<PaymentDto>(`/api/v1/student/invoices/${encodeURIComponent(invoiceId)}/payments`, { method: 'POST', csrf: true }); }
export function getPayment(paymentId: string) { return apiRequest<PaymentDto>(`/api/v1/student/payments/${encodeURIComponent(paymentId)}`); }
export function syncPayments(force = false) { return apiRequest<Record<string, unknown>>(`/api/v1/student/payments/sync${force ? '?force=true' : ''}`, { method: 'POST', csrf: true }); }
export function listPayments(page = 0, size = 100) { return apiRequest<PageDto<PaymentHistoryDto>>(`/api/v1/student/payments?page=${page}&size=${size}`); }

export interface ContractDto {
  contractId: number; roomId: number; startDate: string; endDate: string; monthlyRent: number | string;
  depositAmount: number | string; status: string; description: string | null; roomNumber: string; buildingName: string;
  depositStatus: string; assignmentStatus: string;
}
export function listContracts() { return apiRequest<PageDto<ContractDto>>('/api/v1/student/contracts?page=0&size=20'); }

export interface CheckoutRequestDto {
  checkoutRequestId: number; contractId: number; roomId: number; requestDate: string; checkoutDate: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED' | 'CANCELLED'; reason: string; processedAt: string | null;
  note: string | null; reviewedByName: string | null; depositStatus: string;
}
export function listCheckoutRequests() { return apiRequest<PageDto<CheckoutRequestDto>>('/api/v1/student/checkout-requests?page=0&size=100'); }
export function getCheckoutRequest(id: string) { return apiRequest<CheckoutRequestDto>(`/api/v1/student/checkout-requests/${encodeURIComponent(id)}`); }
export function createCheckoutRequest(reason: string) { return apiRequest<CheckoutRequestDto>('/api/v1/student/checkout-requests', { method: 'POST', body: { reason: reason.trim() }, csrf: true }); }
export function cancelCheckoutRequest(id: string) { return apiRequest<CheckoutRequestDto>(`/api/v1/student/checkout-requests/${encodeURIComponent(id)}/cancel`, { method: 'PATCH', csrf: true }); }

export interface RoomTransferRequestDto {
  transferId: number; studentId: number; contractId: number; currentAssignmentId: number; currentRoomId: number;
  preferredRoomId: number | null; approvedRoomId: number | null; status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  reason: string; requestedAt: string; reviewedById: number | null; reviewedAt: string | null; reviewNote: string | null;
}
export function listRoomTransferRequests(page = 0, size = 100) { return apiRequest<PageDto<RoomTransferRequestDto>>(`/api/v1/student/room-transfer-requests?page=${page}&size=${size}`); }
export function createRoomTransferRequest(reason: string, preferredRoomId?: number) {
  return apiRequest<RoomTransferRequestDto>('/api/v1/student/room-transfer-requests', { method: 'POST', body: { reason: reason.trim(), ...(preferredRoomId ? { preferredRoomId } : {}) }, csrf: true });
}
export function cancelRoomTransferRequest(id: number) { return apiRequest<RoomTransferRequestDto>(`/api/v1/student/room-transfer-requests/${id}/cancel`, { method: 'PATCH', csrf: true }); }

export interface RenewalRequestDto {
  renewalRequestId: number; contractId: number; studentId: number; requestedEndDate: string; contractEndDate: string;
  reason: string | null; status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED'; requestedAt: string;
  reviewedById: number | null; reviewedAt: string | null; reviewNote: string | null;
}
export function listRenewalRequests(page = 0, size = 100) { return apiRequest<PageDto<RenewalRequestDto>>(`/api/v1/student/renewal-requests?page=${page}&size=${size}`); }
export function createRenewalRequest(contractId: number, requestedEndDate: string, reason?: string) {
  return apiRequest<RenewalRequestDto>(`/api/v1/student/contracts/${contractId}/renewal-requests`, { method: 'POST', body: { requestedEndDate, ...(reason?.trim() ? { reason: reason.trim() } : {}) }, csrf: true });
}
export function cancelRenewalRequest(id: number) { return apiRequest<RenewalRequestDto>(`/api/v1/student/renewal-requests/${id}/cancel`, { method: 'PATCH', csrf: true }); }

export interface MaintenanceDto {
  id: number; title: string; description: string; status: string; priority: string; type: string;
  imageUrl: string | null; rejectionReason: string | null; roomId: number; createdAt: string; updatedAt: string; resolvedAt: string | null;
}
export function listMaintenance(page = 0, size = 100) { return apiRequest<PageDto<MaintenanceDto>>(`/api/v1/student/maintenance?page=${page}&size=${size}`); }
export function getMaintenance(id: string) { return apiRequest<MaintenanceDto>(`/api/v1/student/maintenance/${encodeURIComponent(id)}`); }
export function createMaintenance(body: { title: string; assetName?: string; description: string; priority: string; type: string; imageUrl?: string }) {
  return apiRequest<MaintenanceDto>('/api/v1/student/maintenance', { method: 'POST', body, csrf: true });
}

export interface NotificationDto {
  id: number; notificationId: number; type: string; title: string; body: string; refId: number | null;
  isRead: boolean; createdAt: string; readAt: string | null;
}
export function listNotifications(page = 0, size = 100) { return apiRequest<PageDto<NotificationDto>>(`/api/v1/notifications?page=${page}&size=${size}`); }
export function markNotificationReadApi(id: string) { return apiRequest<null>(`/api/v1/notifications/${encodeURIComponent(id)}/read`, { method: 'PATCH', csrf: true }); }
export function markAllNotificationsReadApi() { return apiRequest<null>('/api/v1/notifications/read-all', { method: 'PATCH', csrf: true }); }
