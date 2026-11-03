import type { RepairDraft, RepairRequest } from '../types/repair';
import type { ResidenceSession } from '../types/residence';

export function validateRepairDraft(draft: RepairDraft): string | undefined {
  if (!draft.category) return 'Vui lòng chọn danh mục sự cố.';
  if (!draft.description.trim()) return 'Vui lòng nhập mô tả chi tiết.';
  if (!draft.priority) return 'Vui lòng chọn mức độ ưu tiên.';
  return undefined;
}

export function buildRepairRequest(requests: readonly RepairRequest[], draft: RepairDraft, session: ResidenceSession, date: string, time: string): RepairRequest | null {
  if (session.status !== 'active' || !session.roomId || validateRepairDraft(draft) || !draft.category || !draft.priority) return null;
  const nextNumber = Math.max(0, ...requests.map((item) => Number(item.id.slice(2)) || 0)) + 1;
  const description = draft.description.trim();
  return {
    id: `MR${String(nextNumber).padStart(3, '0')}`, roomId: session.roomId,
    title: description.length > 42 ? `${description.slice(0, 42).trimEnd()}…` : description,
    description, category: draft.category, priority: draft.priority, status: 'RECEIVED',
    createdDate: date, createdTime: time, receivedDate: date, receivedTime: time,
    imageUris: [...draft.imageUris], collection: 'current', createdInSession: true,
  };
}
