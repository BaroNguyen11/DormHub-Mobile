import { featuredInvoiceId } from './invoices';
import type { AppNotification } from '../types/notification';

// Fixed preview clock matches the relative labels in the exported Figma frame.
export const mockNotificationNowIso = '2026-09-11T08:25:00';

export const initialNotifications: readonly AppNotification[] = [
  {
    id: 'notification-invoice-september', type: 'INVOICE', title: 'Hóa đơn tháng 9',
    summary: 'Hóa đơn 1.300.000đ đã được tạo.',
    body: 'Hóa đơn tháng 9 của phòng A203 đã được lập với số tiền 1.300.000đ, bao gồm tiền phòng, tiền điện, tiền nước. Vui lòng thanh toán trước ngày 15/09/2026 để tránh phát sinh phí trễ hạn.',
    createdAt: '2026-09-11T08:15:00', isRead: false, targetId: featuredInvoiceId,
    emphasis: ['A203', '1.300.000đ', '15/09/2026'],
  },
  {
    id: 'notification-repair-mr001', type: 'REPAIR', title: 'Yêu cầu sửa chữa',
    summary: 'Yêu cầu MR001 đang được xử lý.', body: 'Yêu cầu MR001 đang được xử lý.',
    createdAt: '2026-09-11T06:25:00', isRead: true,
  },
  {
    id: 'notification-contract', type: 'CONTRACT', title: 'Hợp đồng',
    summary: 'Hợp đồng HD-2026-0342 còn 20 ngày hết hạn.', body: 'Hợp đồng HD-2026-0342 còn 20 ngày hết hạn.',
    createdAt: '2026-09-10T08:25:00', isRead: true,
  },
  {
    id: 'notification-payment-august', type: 'PAYMENT', title: 'Thanh toán',
    summary: 'Thanh toán hóa đơn tháng 8 thành công.', body: 'Thanh toán hóa đơn tháng 8 thành công.',
    createdAt: '2026-09-10T08:25:00', isRead: true,
  },
  {
    id: 'notification-system-water', type: 'SYSTEM', title: 'Thông báo hệ thống',
    summary: 'Bảo trì hệ thống nước Tòa A từ 22h-24h ngày 05/09.',
    body: 'Bảo trì hệ thống nước Tòa A từ 22h-24h ngày 05/09.',
    createdAt: '2026-09-05T08:25:00', isRead: true,
  },
];
