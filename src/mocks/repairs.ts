import type { RepairCategory, RepairDraft, RepairPriority, RepairRequest, RepairStatus } from '../types/repair';

export const additionalRepairCategories: readonly { id: RepairCategory; label: string; symbol: string }[] = [
  { id: 'FAN', label: 'Quạt', symbol: '' }, { id: 'REFRIGERATOR', label: 'Tủ lạnh', symbol: '' }, { id: 'DOOR_WINDOW', label: 'Cửa / cửa sổ', symbol: '' },
];

export const repairCategories: readonly { id: RepairCategory; label: string; symbol: string }[] = [
  { id: 'ELECTRIC', label: 'Điện', symbol: '⚡' }, { id: 'WATER', label: 'Nước', symbol: '💧' },
  { id: 'AIR_CONDITIONER', label: 'Điều hòa', symbol: '❄️' }, { id: 'FURNITURE', label: 'Nội thất', symbol: '🪑' },
  { id: 'ROOM', label: 'Phòng', symbol: '🚪' }, { id: 'OTHER', label: 'Khác', symbol: '' },
];
export const repairPriorities: readonly { id: RepairPriority; label: string }[] = [
  { id: 'LOW', label: 'Thấp' }, { id: 'MEDIUM', label: 'Trung bình' }, { id: 'HIGH', label: 'Cao' }, { id: 'URGENT', label: 'Khẩn cấp' },
];
export const repairStatusLabels: Readonly<Partial<Record<RepairStatus, string>>> = {
  RECEIVED: 'Đã tiếp nhận', IN_PROGRESS: 'Đang xử lý', COMPLETED: 'Hoàn thành', CANCELLED: 'Đã hủy',
};
export const repairDraftExample: RepairDraft = { category: 'ELECTRIC', description: 'Ổ cắm điện gần bàn học có tia lửa khi cắm sạc, có mùi khét nhẹ.', priority: 'HIGH', imageUris: [] };
export const mockRepairDate = '11/09/2026';
export const mockRepairTime = '10:42';

export const initialRepairRequests: readonly RepairRequest[] = [
  { id: 'MR001', roomId: 'A203', title: 'Ổ cắm điện phòng bị chập', description: repairDraftExample.description, category: 'ELECTRIC', priority: 'HIGH', status: 'IN_PROGRESS', createdDate: '10/09/2026', createdTime: '19:12', receivedDate: '10/09/2026', receivedTime: '20:05', progressNote: 'Kỹ thuật viên sẽ đến trong hôm nay', imageUris: [], showAttachmentPlaceholder: true, collection: 'current' },
  { id: 'MR002', roomId: 'A203', title: 'Vòi nước WC bị rò rỉ', description: '', category: 'WATER', priority: 'MEDIUM', status: 'RECEIVED', createdDate: '08/09/2026', imageUris: [], collection: 'current' },
  { id: 'MR003', roomId: 'A203', title: 'Điều hòa không lạnh', description: '', category: 'AIR_CONDITIONER', priority: 'MEDIUM', status: 'COMPLETED', createdDate: '28/08/2026', imageUris: [], collection: 'current' },
  { id: 'MR101', roomId: 'A203', title: 'Ổ cắm điện phòng bị chập', description: '', category: 'ELECTRIC', priority: 'HIGH', status: 'IN_PROGRESS', createdDate: '14/07/2026', imageUris: [], collection: 'history' },
  { id: 'MR102', roomId: 'A203', title: 'Điều hòa không lạnh', description: '', category: 'AIR_CONDITIONER', priority: 'MEDIUM', status: 'COMPLETED', createdDate: '28/08/2026', imageUris: [], collection: 'history' },
  { id: 'MR103', roomId: 'A203', title: 'Bản lề tủ quần áo bị gãy', description: '', category: 'FURNITURE', priority: 'LOW', status: 'COMPLETED', createdDate: '14/07/2026', imageUris: [], collection: 'history' },
  { id: 'MR104', roomId: 'A203', title: 'Bồn rửa mặt bị nghẹt', description: '', category: 'WATER', priority: 'LOW', status: 'CANCELLED', createdDate: '02/06/2026', imageUris: [], collection: 'history' },
];
