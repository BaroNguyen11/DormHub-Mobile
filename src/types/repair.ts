// Frontend mock view models; these are not backend DTOs.
export type RepairCategory = 'ELECTRIC' | 'WATER' | 'AIR_CONDITIONER' | 'FURNITURE' | 'ROOM' | 'OTHER';
export type RepairPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type RepairStatus = 'RECEIVED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface RepairRequest {
  id: string;
  roomId: string;
  title: string;
  description: string;
  category: RepairCategory;
  priority: RepairPriority;
  status: RepairStatus;
  createdDate: string; // DD/MM/YYYY, visual mock data.
  createdTime?: string;
  receivedDate?: string;
  receivedTime?: string;
  progressNote?: string;
  imageUris: readonly string[];
  showAttachmentPlaceholder?: boolean;
  collection: 'current' | 'history';
  createdInSession?: boolean;
}

export interface RepairDraft {
  category: RepairCategory | null;
  description: string;
  priority: RepairPriority | null;
  imageUris: readonly string[];
}
