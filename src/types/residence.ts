// Local UI view models. They do not describe backend DTOs.
export type ResidenceStatus = 'none' | 'active' | 'pending' | 'approved' | 'rejected' | 'checkoutPending';

export interface ResidenceSession { status: ResidenceStatus; roomId: string | null; room?: { roomId: number; roomNumber: string; buildingName: string; floor: number; capacity: number; currentOccupancy: number; pricePerMonth: number | string; assignmentId: number; contractId: number; assignmentStatus: string; contractStatus: string } }
export interface RoomApplication { id?: number; roomId: string; sentDate: string; sentTime: string; status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED'; note?: string; decisionDate?: string; decisionTime?: string; rejectionReason?: string }
