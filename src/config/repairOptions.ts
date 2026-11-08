import type { RepairCategory, RepairPriority, RepairStatus } from '../types/repair';

export const additionalRepairCategories: readonly { id: RepairCategory; label: string; symbol: string }[] = [
  { id: 'FAN', label: 'Quạt', symbol: '' },
  { id: 'REFRIGERATOR', label: 'Tủ lạnh', symbol: '' },
  { id: 'DOOR_WINDOW', label: 'Cửa / cửa sổ', symbol: '' },
];
export const repairCategories: readonly { id: RepairCategory; label: string; symbol: string }[] = [
  { id: 'ELECTRIC', label: 'Điện', symbol: '⚡' },
  { id: 'WATER', label: 'Nước', symbol: '💧' },
  { id: 'AIR_CONDITIONER', label: 'Điều hòa', symbol: '❄️' },
  { id: 'FURNITURE', label: 'Nội thất', symbol: '🪑' },
  { id: 'ROOM', label: 'Phòng', symbol: '🚪' },
  { id: 'OTHER', label: 'Khác', symbol: '' },
];
export const repairPriorities: readonly { id: RepairPriority; label: string }[] = [
  { id: 'LOW', label: 'Thấp' }, { id: 'MEDIUM', label: 'Trung bình' },
  { id: 'HIGH', label: 'Cao' }, { id: 'URGENT', label: 'Khẩn cấp' },
];
export const repairStatusLabels: Readonly<Partial<Record<RepairStatus, string>>> = {
  RECEIVED: 'Đã tiếp nhận', IN_PROGRESS: 'Đang xử lý',
  COMPLETED: 'Hoàn thành', CANCELLED: 'Đã hủy', REJECTED: 'Bị từ chối',
};
