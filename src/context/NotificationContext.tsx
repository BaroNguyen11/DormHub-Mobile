import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { PropsWithChildren } from 'react';
import { listNotifications, markAllNotificationsReadApi, markNotificationReadApi } from '../api/student';
import type { NotificationDto } from '../api/student';
import { useAuth } from './AuthContext';
import type { AppNotification } from '../types/notification';

interface NotificationContextValue {
  notifications: readonly AppNotification[];
  loading: boolean;
  error: string | null;
  refreshNotifications: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
}
const NotificationContext = createContext<NotificationContextValue | null>(null);
function view(dto: NotificationDto): AppNotification {
  const type = dto.type.startsWith('INVOICE') ? 'INVOICE' : dto.type.startsWith('PAYMENT') ? 'PAYMENT' : dto.type.startsWith('CONTRACT') || dto.type.includes('ROOM') || dto.type.includes('APPLICATION') ? 'CONTRACT' : dto.type.startsWith('MAINTENANCE') ? 'REPAIR' : 'SYSTEM';
  return { id: String(dto.id), type, title: dto.title, summary: dto.body, body: dto.body, createdAt: dto.createdAt, isRead: dto.isRead, targetId: dto.refId == null ? undefined : String(dto.refId) };
}
export function NotificationProvider({ children }: PropsWithChildren) {
  const auth = useAuth();
  const [notifications, setNotifications] = useState<readonly AppNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const refreshNotifications = useCallback(async () => {
    if (auth.status !== 'authenticated') { setNotifications([]); setError(null); setLoading(false); return; }
    setLoading(true);
    setError(null);
    try { setNotifications((await listNotifications()).data.content.map(view)); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Không tải được thông báo.'); throw cause; }
    finally { setLoading(false); }
  }, [auth.status, auth.status === 'authenticated' ? auth.user.userId : null]);
  useEffect(() => { void refreshNotifications().catch(() => undefined); }, [refreshNotifications]);
  const markRead = useCallback(async (id: string) => {
    setNotifications((items) => items.map((item) => item.id === id ? { ...item, isRead: true } : item));
    try { await markNotificationReadApi(id); }
    catch (error) { await refreshNotifications().catch(() => undefined); throw error; }
  }, [refreshNotifications]);
  const markAllRead = useCallback(async () => {
    setNotifications((items) => items.map((item) => ({ ...item, isRead: true })));
    try { await markAllNotificationsReadApi(); }
    catch (error) { await refreshNotifications().catch(() => undefined); throw error; }
  }, [refreshNotifications]);
  return <NotificationContext.Provider value={{ notifications, loading, error, refreshNotifications, markRead, markAllRead }}>{children}</NotificationContext.Provider>;
}
export function useNotifications() { const value = useContext(NotificationContext); if (!value) throw new Error('NotificationProvider is missing'); return value; }
