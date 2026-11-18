import type { RepairDraft } from '../types/repair';

export function validateRepairDraft(draft: RepairDraft): string | undefined {
  if (!draft.title.trim()) return 'Vui lòng nhập tên thiết bị hoặc sự cố.';
  if (!draft.description.trim()) return 'Vui lòng nhập mô tả chi tiết.';
  if (!draft.priority) return 'Vui lòng chọn mức độ ưu tiên.';
  return undefined;
}
