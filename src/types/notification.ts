// Frontend preview model. This is not a Spring Boot DTO.
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
