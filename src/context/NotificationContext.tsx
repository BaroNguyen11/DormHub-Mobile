import { createContext, useCallback, useContext, useRef, useState } from 'react';
import type { PropsWithChildren } from 'react';
import { getNotifications, getUnreadNotificationCount, markAllNotificationsReadOnServer, markNotificationReadOnServer } from '../api/notifications';
import type { AppNotification } from '../types/notification';
import { markAllNotificationsRead, markNotificationRead } from '../utils/notification';

interface NotificationContextValue {
  notifications: readonly AppNotification[];
  unreadCount: number;
  isLoading: boolean;
  hasMore: boolean;
  error: string | null;
  markRead: (id: string) => void;
  markAllRead: () => void;
  loadMore: () => void;
  refresh: () => void;
  resetForAccount: (authenticated: boolean) => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function NotificationProvider({ children }: PropsWithChildren) {
  const [notifications, setNotifications] = useState<readonly AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const backendAccountRef = useRef(false);
  const pageRef = useRef(0);
  const accountEpochRef = useRef(0);
  const loadingEpochRef = useRef<number | null>(null);

  const loadPage = useCallback(async (page: number, replace: boolean) => {
    const epoch = accountEpochRef.current;
    if (!backendAccountRef.current || loadingEpochRef.current === epoch) return;
    loadingEpochRef.current = epoch;
    setIsLoading(true);
    try {
      const result = await getNotifications(page, 10, false);
      if (epoch !== accountEpochRef.current || !backendAccountRef.current) return;
      setNotifications((previous) => {
        if (replace) return result.content;
        const existing = new Set(previous.map((item) => item.id));
        return [...previous, ...result.content.filter((item) => !existing.has(item.id))];
      });
      pageRef.current = result.page;
      setHasMore(!result.last);
      setError(null);
      try {
        const count = await getUnreadNotificationCount();
        if (epoch === accountEpochRef.current && backendAccountRef.current) setUnreadCount(count);
      } catch (countError) {
        if (epoch === accountEpochRef.current) setError(countError instanceof Error ? countError.message : 'Could not load unread notification count.');
      }
    } catch (loadError) {
      if (epoch === accountEpochRef.current) setError(loadError instanceof Error ? loadError.message : 'Could not load notifications.');
    } finally {
      if (loadingEpochRef.current === epoch) {
        loadingEpochRef.current = null;
        setIsLoading(false);
      }
    }
  }, []);

  const markRead = useCallback((id: string) => {
    const item = notifications.find((notification) => notification.id === id);
    if (!item || item.isRead) return;
    const epoch = accountEpochRef.current;
    void (async () => {
      try {
        await markNotificationReadOnServer(id);
        if (epoch !== accountEpochRef.current || !backendAccountRef.current) return;
        setNotifications((previous) => markNotificationRead(previous, id));
        setUnreadCount((previous) => Math.max(0, previous - 1));
      } catch (markError) {
        if (epoch === accountEpochRef.current) setError(markError instanceof Error ? markError.message : 'Could not mark notification as read.');
      }
    })();
  }, [notifications]);

  const markAllRead = useCallback(() => {
    if (backendAccountRef.current) {
      if (unreadCount === 0) return;
      const epoch = accountEpochRef.current;
      void (async () => {
        try {
          await markAllNotificationsReadOnServer();
          if (epoch !== accountEpochRef.current || !backendAccountRef.current) return;
          setNotifications((previous) => markAllNotificationsRead(previous));
          setUnreadCount(0);
        } catch (markError) {
          if (epoch === accountEpochRef.current) setError(markError instanceof Error ? markError.message : 'Could not mark all notifications as read.');
        }
      })();
      return;
    }
  }, [unreadCount]);

  const loadMore = useCallback(() => {
    if (hasMore && loadingEpochRef.current !== accountEpochRef.current) void loadPage(pageRef.current + 1, false);
  }, [hasMore, loadPage]);
  const refresh = useCallback(() => {
    pageRef.current = 0;
    void loadPage(0, true);
  }, [loadPage]);
  const resetForAccount = useCallback((authenticated: boolean) => {
    accountEpochRef.current += 1;
    loadingEpochRef.current = null;
    setIsLoading(false);
    backendAccountRef.current = authenticated;
    pageRef.current = 0;
    setError(null);
    setHasMore(false);
    setUnreadCount(0);
    if (authenticated) {
      setNotifications([]);
      void loadPage(0, true);
      return;
    }
    setNotifications([]);
  }, [loadPage]);

  return <NotificationContext.Provider value={{ notifications, unreadCount, isLoading, hasMore, error, markRead, markAllRead, loadMore, refresh, resetForAccount }}>{children}</NotificationContext.Provider>;
}

export function useNotifications() {
  const value = useContext(NotificationContext);
  if (!value) throw new Error('NotificationProvider is missing');
  return value;
}
