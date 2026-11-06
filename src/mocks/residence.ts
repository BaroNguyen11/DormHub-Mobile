import type { ContractOverview, HomeOverview, RoomApplication, StudentProfile, UtilityOverview } from '../types/residence';

export const studentProfile: StudentProfile = { name: 'Baro', initials: 'MA', greetingDate: 'Thứ Sáu, 3/6' };
export const residentRoom = { id: 'A203', name: 'Phòng A203', building: 'Tòa A', floor: 2, occupied: 3, capacity: 4, monthlyPrice: 1500000 } as const;
export const roommates = [{ initials: 'NB', name: 'Nguyễn Văn Bảo', role: 'Bạn' }, { initials: 'NB', name: 'Nguyễn Văn Bình', role: 'Thành viên' }, { initials: 'HT', name: 'Hồ Tùng', role: 'Thành viên' }] as const;
export const residenceAmenities = [{ icon: 'wifi', label: 'Wi-Fi' }, { icon: 'wind', label: 'Điều hòa' }, { icon: 'droplet', label: 'WC riêng' }, { icon: 'inbox', label: 'Bàn, tủ' }] as const;
export const pendingApplication: RoomApplication = { roomId: 'A203', sentDate: '11/09/2026', sentTime: '09:20' };
export const rejectedApplication: RoomApplication = { roomId: 'B105', sentDate: '05/09/2026', sentTime: '08:10', decisionDate: '06/09/2026', decisionTime: '14:02', rejectionReason: 'Phòng đã đủ số lượng người ở tại thời điểm duyệt.' };
export const contractOverview: ContractOverview = { number: 'HD-2026-0342', roomLabel: 'A203 · Tòa A', startDate: '01/09/2025', endDate: '31/08/2026', monthlyPrice: 1500000, deposit: 1500000, terms: ['Thanh toán tiền phòng trước ngày 05 hàng tháng', 'Không tự ý chuyển nhượng chỗ ở cho người khác', 'Vi phạm nội quy có thể dẫn đến chấm dứt hợp đồng'] };
export const utilityOverview: UtilityOverview = { month: 'Tháng 9/2026', electricityKwh: 125, previousElectricityKwh: 100, waterM3: 4, previousWaterM3: 4, electricityHistory: [{ month: 'T4', kwh: 78 }, { month: 'T5', kwh: 98 }, { month: 'T6', kwh: 69 }, { month: 'T7', kwh: 110 }, { month: 'T8', kwh: 87 }, { month: 'T9', kwh: 125 }] };
export const homeOverview: HomeOverview = { notifications: [{ title: 'Hóa đơn tháng 9', message: 'Hóa đơn 1.300.000đ đã được tạo', time: '10p', icon: 'file-text' }, { title: 'Yêu cầu sửa chữa', message: 'MR001 đang được xử lý', time: '2h', icon: 'tool' }] };
export const registrationStartDate = '15/09/2026';
