import type { RoomDetail, RoomPreview, RoomSearchFilters } from '../types/room';

// The three visible cards and the result label in Figma frame 1086:2056.
export const exploreRooms: readonly RoomPreview[] = [
  { id: 'A203', name: 'Phòng A203', building: 'Tòa A', floor: 2, monthlyPrice: 1500000, occupied: 2, capacity: 4, amenity: 'Có điều hòa' },
  { id: 'B105', name: 'Phòng B105', building: 'Tòa B', floor: 1, monthlyPrice: 1350000, occupied: 3, capacity: 4, amenity: 'Ban công' },
  { id: 'A108', name: 'Phòng A108', building: 'Tòa A', floor: 1, monthlyPrice: 1500000, occupied: 4, capacity: 4 },
];

export const initialAvailableResultCount = 24;

export const designFilterPreset: RoomSearchFilters = {
  building: 'Tòa A', price: '1mTo1_5m', capacity: 4, onlyAvailable: true,
};

export const emptyRoomFilters: RoomSearchFilters = {
  building: null, price: null, capacity: null, onlyAvailable: false,
};

export const roomDetails: Readonly<Record<string, RoomDetail>> = {
  A203: {
    ...exploreRooms[0],
    photoAsset: require('../../assets/figma/room-detail-photo.png'),
    description: 'Phòng thoáng mát, cửa sổ hướng sân trong, gần thang máy và khu vực giặt sấy chung. Phù hợp cho sinh viên năm 2 trở lên.',
    amenities: ['Wi-Fi miễn phí', 'Điều hòa', 'WC riêng', 'Bàn học, tủ'],
    rules: ['Không hút thuốc trong phòng', 'Giờ giới nghiêm: 23:00 - 05:00', 'Giữ vệ sinh chung, không nuôi thú cưng'],
  },
  B105: { ...exploreRooms[1], amenities: [], rules: [] },
  A108: { ...exploreRooms[2], amenities: [], rules: [] },
};
