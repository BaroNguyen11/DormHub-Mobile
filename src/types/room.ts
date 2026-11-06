// Frontend view model for the Figma demo, not a Spring Boot DTO.
export interface RoomPreview {
  id: string;
  name: string;
  building: string;
  floor: number;
  monthlyPrice: number;
  occupied: number;
  capacity: number;
  amenity?: string;
}

export type RoomFilter = 'all' | 'buildingA' | 'buildingB' | 'under1500000' | 'available';

export interface RoomSearchFilters {
  building: 'Tòa A' | 'Tòa B' | 'Tòa C' | null;
  price: 'under1m' | '1mTo1_5m' | 'over1_5m' | null;
  capacity: 2 | 4 | 6 | null;
  onlyAvailable: boolean;
}

export interface RoomDetail extends RoomPreview {
  photoAsset?: number;
  description?: string;
  amenities: readonly string[];
  rules: readonly string[];
}
