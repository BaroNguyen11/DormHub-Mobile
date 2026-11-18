// UI model mapped from the public and student room APIs.
export interface RoomListItem {
  id: string;
  name: string;
  building: string;
  floor: number;
  monthlyPrice: number;
  occupied: number;
  capacity: number;
  amenity?: string;
}

// RoomResponse returned by the public and student room endpoints.
export interface RoomDto {
  id: number;
  roomNumber: string;
  floor: number | null;
  buildingName: string | null;
  capacity: number | null;
  currentOccupancy: number | null;
  pricePerMonth: number | string | null;
  status: string | null;
  description: string | null;
}

export type RoomFilter = 'all' | 'buildingA' | 'buildingB' | 'under1500000' | 'available';

export interface RoomSearchFilters {
  building: 'Tòa A' | 'Tòa B' | 'Tòa C' | null;
  price: 'under1m' | '1mTo1_5m' | 'over1_5m' | null;
  capacity: 2 | 4 | 6 | null;
  onlyAvailable: boolean;
}

export interface RoomDetail extends RoomListItem {
  photoAsset?: number;
  description?: string;
  amenities: readonly string[];
  rules: readonly string[];
}
