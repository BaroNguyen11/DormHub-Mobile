// UI models mapped from maintenance API data.
export type RepairCategory = 'FAN' | 'AIR_CONDITIONER' | 'REFRIGERATOR' | 'LIGHTING' | 'PLUMBING' | 'FURNITURE' | 'DOOR_WINDOW' | 'OTHER';
export type RepairPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type RepairStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED';

export interface RepairRequest {
  id: string;
  roomId: string;
  title: string;
  assetName?: string;
  description: string;
  category: RepairCategory;
  priority: RepairPriority;
  status: RepairStatus;
  createdDate: string;
  createdTime?: string;
  receivedDate?: string;
  receivedTime?: string;
  progressNote?: string;
  updatedDate?: string;
  resolvedDate?: string;
  rejectionReason?: string;
  imageUris: readonly string[];
  collection: 'current' | 'history';
}

export interface RepairDraft {
  title: string;
  description: string;
  category: RepairCategory;
  priority: RepairPriority | null;
  imageUris: readonly string[];
}
