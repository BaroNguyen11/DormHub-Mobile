import type { RoomDetail, RoomDto, RoomListItem } from '../types/room';

export function roomDtoToListItem(room: RoomDto): RoomListItem {
  return {
    id: String(room.id),
    name: `Phòng ${room.roomNumber}`,
    building: room.buildingName ?? 'Ký túc xá',
    floor: room.floor ?? 0,
    monthlyPrice: Number(room.pricePerMonth ?? 0),
    occupied: room.currentOccupancy ?? 0,
    capacity: room.capacity ?? 0,
    amenity: undefined,
  };
}

export function roomDtoToDetail(room: RoomDto): RoomDetail {
  return {
    ...roomDtoToListItem(room),
    description: room.description ?? undefined,
    amenities: [],
    rules: [],
  };
}
