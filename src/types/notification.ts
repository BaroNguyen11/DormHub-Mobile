// UI model mapped from the notification API.
export type NotificationType = 'INVOICE' | 'REPAIR' | 'CONTRACT' | 'PAYMENT' | 'SYSTEM';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  summary: string;
  body: string;
  createdAt: string;
  isRead: boolean;
  targetId?: string;
  emphasis?: readonly string[];
}
