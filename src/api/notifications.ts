import type { AppNotification, BackendNotificationDto } from '../types/notification';
import { apiClient, getApiErrorMessage } from './client';

interface ApiEnvelope<T> {
  code: string;
  message: string;
  data: T;
}

interface PageData<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  numberOfElements: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

interface UnreadCountData {
  unreadCount: number;
}

interface CsrfData {
  token: string;
}

export interface NotificationPage {
  content: AppNotification[];
  last: boolean;
  page: number;
}

function mapNotificationType(type: string): AppNotification['type'] {
  const normalized = type.toUpperCase();
  if (normalized.includes('PAYMENT')) return 'PAYMENT';
  if (normalized.includes('INVOICE')) return 'INVOICE';
  if (normalized.includes('REPAIR')) return 'REPAIR';
  if (normalized.includes('CONTRACT')) return 'CONTRACT';
  return 'SYSTEM';
}

function mapNotification(notification: BackendNotificationDto): AppNotification {
  return {
    id: String(notification.id),
    sourceNotificationId: String(notification.notificationId),
    type: mapNotificationType(notification.type),
    title: notification.title,
    summary: notification.body,
    body: notification.body,
    createdAt: notification.createdAt,
    isRead: notification.read,
    targetId: notification.refId == null ? undefined : String(notification.refId),
  };
}

function unwrap<T>(response: ApiEnvelope<T>): T {
  if (response.code !== 'SUCCESS' || response.data == null) {
    throw new Error(response.message || 'Notification request failed.');
  }
  return response.data;
}

export async function getNotifications(page = 0, size = 10, unreadOnly = false): Promise<NotificationPage> {
  try {
    const response = await apiClient.get<ApiEnvelope<PageData<BackendNotificationDto>>>('/notifications', {
      params: { page, size, unreadOnly },
    });
    const data = unwrap(response.data);
    return { content: data.content.map(mapNotification), last: data.last, page: data.number };
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Could not load notifications.'));
  }
}

export async function getUnreadNotificationCount(): Promise<number> {
  try {
    const response = await apiClient.get<ApiEnvelope<UnreadCountData>>('/notifications/unread-count');
    return unwrap(response.data).unreadCount;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Could not load unread notification count.'));
  }
}

async function getCsrfToken(): Promise<string> {
  const response = await apiClient.get<ApiEnvelope<CsrfData>>('/auth/csrf');
  const token = response.data.data?.token;
  if (!token) throw new Error('Backend did not return a CSRF token.');
  return token;
}

async function patchWithCsrf(path: string): Promise<void> {
  const token = await getCsrfToken();
  const response = await apiClient.patch<ApiEnvelope<null>>(path, undefined, {
    headers: { 'X-XSRF-TOKEN': token },
  });
  if (response.data.code !== 'SUCCESS') {
    throw new Error(response.data.message || 'Could not update notification status.');
  }
}

export async function markNotificationReadOnServer(id: string): Promise<void> {
  try {
    await patchWithCsrf(`/notifications/${encodeURIComponent(id)}/read`);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Could not mark notification as read.'));
  }
}

export async function markAllNotificationsReadOnServer(): Promise<void> {
  try {
    await patchWithCsrf('/notifications/read-all');
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Could not mark all notifications as read.'));
  }
}
