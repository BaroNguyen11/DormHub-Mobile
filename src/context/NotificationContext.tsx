import { createContext, useCallback, useContext, useState } from 'react';
import type { PropsWithChildren } from 'react';
import { initialNotifications } from '../mocks/notifications';
import type { DevPreviewAccountId } from '../types/auth';
import type { AppNotification } from '../types/notification';
import { markAllNotificationsRead, markNotificationRead } from '../utils/notification';

interface NotificationContextValue {
  notifications: readonly AppNotification[];
  markRead: (id: string) => void;
  markAllRead: () => void;
  resetForAccount: (accountId: DevPreviewAccountId | null) => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function NotificationProvider({ children }: PropsWithChildren) {
  const [notifications, setNotifications] = useState<readonly AppNotification[]>([]);
  const markRead = useCallback((id: string) => {
    setNotifications((previous) => markNotificationRead(previous, id));
  }, []);
  const markAllRead = useCallback(() => {
    setNotifications((previous) => markAllNotificationsRead(previous));
  }, []);
  const resetForAccount = useCallback((accountId: DevPreviewAccountId | null) => {
    setNotifications(accountId === 'student' ? initialNotifications.map((item) => ({ ...item, emphasis: item.emphasis ? [...item.emphasis] : undefined })) : []);
  }, []);
  return <NotificationContext.Provider value={{ notifications, markRead, markAllRead, resetForAccount }}>{children}</NotificationContext.Provider>;
}

export function useNotifications() {
  const value = useContext(NotificationContext);
  if (!value) throw new Error('NotificationProvider is missing');
  return value;
}
