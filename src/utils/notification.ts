import type { AppNotification } from '../types/notification';

export type NotificationSectionTitle = 'Hôm nay' | 'Hôm qua' | 'Tuần trước';

export function markNotificationRead(items: readonly AppNotification[], id: string): readonly AppNotification[] {
  return items.map((item) => item.id === id && !item.isRead ? { ...item, isRead: true } : item);
}

export function markAllNotificationsRead(items: readonly AppNotification[]): readonly AppNotification[] {
  return items.map((item) => item.isRead ? item : { ...item, isRead: true });
}

function dayNumber(iso: string): number {
  const [year, month, day] = iso.slice(0, 10).split('-').map(Number);
  return Date.UTC(year, month - 1, day) / 86400000;
}

export function notificationSection(createdAt: string, nowIso: string): NotificationSectionTitle {
  const days = dayNumber(nowIso) - dayNumber(createdAt);
  return days <= 0 ? 'Hôm nay' : days === 1 ? 'Hôm qua' : 'Tuần trước';
}

export function notificationTimeLabel(createdAt: string, nowIso: string): string {
  const minutes = Math.max(0, Math.floor((new Date(nowIso).getTime() - new Date(createdAt).getTime()) / 60000));
  if (minutes < 60) return `${minutes}p`;
  if (minutes < 1440) return `${Math.floor(minutes / 60)}h`;
  return `${Math.floor(minutes / 1440)}n`;
}

export function notificationDateTime(createdAt: string): string {
  const [year, month, day] = createdAt.slice(0, 10).split('-');
  return `${day}/${month}/${year} · ${createdAt.slice(11, 16)}`;
}

export function notificationSections(items: readonly AppNotification[], nowIso: string) {
  const titles: readonly NotificationSectionTitle[] = ['Hôm nay', 'Hôm qua', 'Tuần trước'];
  return titles.map((title) => ({
    title,
    data: items.filter((item) => notificationSection(item.createdAt, nowIso) === title)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
  })).filter((section) => section.data.length > 0);
}
