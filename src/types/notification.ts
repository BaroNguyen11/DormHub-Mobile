// Frontend preview model. This is not a Spring Boot DTO.
export type NotificationType = 'INVOICE' | 'REPAIR' | 'CONTRACT' | 'PAYMENT' | 'SYSTEM';

export interface BackendNotificationDto {
  id: number;
  notificationId: number;
  type: string;
  title: string;
  body: string;
  refId: number | null;
  read: boolean;
  createdAt: string;
  readAt: string | null;
}

export interface AppNotification {
  id: string;
  sourceNotificationId?: string;
  type: NotificationType;
  title: string;
  summary: string;
  body: string;
  createdAt: string;
  isRead: boolean;
  targetId?: string;
  emphasis?: readonly string[];
}
