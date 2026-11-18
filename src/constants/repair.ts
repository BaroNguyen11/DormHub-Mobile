import type { RepairCategory, RepairPriority, RepairStatus } from '../types/repair';

export const repairCategories: readonly { id: RepairCategory; label: string; symbol: string }[] = [
  { id: 'FAN', label: 'Quạt', symbol: '🌀' },
  { id: 'AIR_CONDITIONER', label: 'Điều hòa', symbol: '❄️' },
  { id: 'REFRIGERATOR', label: 'Tủ lạnh', symbol: '🧊' },
  { id: 'LIGHTING', label: 'Đèn', symbol: '💡' },
  { id: 'PLUMBING', label: 'Nước', symbol: '💧' },
  { id: 'FURNITURE', label: 'Nội thất', symbol: '🪑' },
  { id: 'DOOR_WINDOW', label: 'Cửa / khóa', symbol: '🚪' },
  { id: 'OTHER', label: 'Khác', symbol: '' },
];
export const repairPriorities: readonly { id: RepairPriority; label: string }[] = [
  { id: 'LOW', label: 'Thấp' }, { id: 'MEDIUM', label: 'Trung bình' }, { id: 'HIGH', label: 'Cao' }, { id: 'URGENT', label: 'Khẩn cấp' },
];
export const repairStatusLabels: Readonly<Record<RepairStatus, string>> = {
  PENDING: 'Đang chờ xử lý', IN_PROGRESS: 'Đang xử lý', COMPLETED: 'Hoàn thành', REJECTED: 'Đã từ chối',
};
