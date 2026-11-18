import { apiRequest } from './httpClient';
import type { RoomDto } from '../types/room';

export interface DormApplicationDto {
  id: number;
  requestedRoomId: number;
  requestedRoomNumber: string;
  requestedBuildingName: string;
  requestDate: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  note: string | null;
  reviewNote: string | null;
  processedAt: string | null;
  depositInvoiceId: number | null;
  depositAmount: number | string | null;
}

export interface RoomAssignmentDto {
  assignmentId: number; contractId: number; roomId: number; assignmentStatus: string; contractStatus: string;
  assignedAt: string | null; checkInAt: string | null; checkOutAt: string | null; roomNumber: string;
  buildingName: string; floor: number; capacity: number; currentOccupancy: number; pricePerMonth: number | string;
}

export interface RoommateDto { fullName: string; studentCode: string; gender: string }

interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export function getMyAssignments() {
  return apiRequest<PageResponse<RoomAssignmentDto>>('/api/v1/student/room-assignments?page=0&size=20');
}

export function getMyRoommates() {
  return apiRequest<RoommateDto[]>('/api/v1/student/room-assignments/roommates');
}

export function getPublicAvailableRooms() {
  return apiRequest<RoomDto[]>('/api/v1/rooms/available', { retryOnUnauthorized: false });
}

export function getStudentAvailableRooms() {
  return apiRequest<RoomDto[]>('/api/v1/student/rooms-available');
}

export function getRoom(roomId: string, student: boolean) {
  const id = encodeURIComponent(roomId);
  return apiRequest<RoomDto>(student ? `/api/v1/student/rooms-available/${id}` : `/api/v1/rooms/${id}`);
}

export function submitDormApplication(roomId: string, note: string) {
  const id = Number(roomId);
  if (!Number.isSafeInteger(id) || id <= 0) throw new Error('Mã phòng không hợp lệ.');
  return apiRequest<DormApplicationDto>('/api/v1/student/dorm-applications', {
    method: 'POST',
    body: { roomId: id, ...(note.trim() ? { note: note.trim() } : {}) },
  });
}

export function getMyDormApplications(page = 0, size = 20) {
  return apiRequest<PageResponse<DormApplicationDto>>(`/api/v1/student/dorm-applications?page=${page}&size=${size}`);
}

export function cancelDormApplication(applicationId: number) {
  return apiRequest<DormApplicationDto>(`/api/v1/student/dorm-applications/${applicationId}/cancel`, { method: 'PATCH' });
}
