import { apiClient } from './client';

interface ApiEnvelope<T> {
  code: string;
  message: string;
  data: T;
}

export interface StudentRoomAssignment {
  assignmentId: number;
  contractId: number;
  studentId: number;
  roomId: number;
  assignedById: number;
  assignmentStatus: 'ASSIGNED' | 'CHECKED_IN' | 'CHECKED_OUT' | 'CANCELLED';
  contractStatus: string;
  assignedAt: string;
  checkInAt: string | null;
  checkOutAt: string | null;
}

interface PageData<T> {
  content: T[];
  number: number;
  last: boolean;
}

export async function getStudentRoomAssignments(page = 0, size = 20): Promise<readonly StudentRoomAssignment[]> {
  const response = await apiClient.get<ApiEnvelope<PageData<StudentRoomAssignment>>>('/student/room-assignments', {
    params: { page, size },
  });
  if (response.data.code !== 'SUCCESS' || !response.data.data) {
    throw new Error(response.data.message || 'Could not load room assignments.');
  }
  return response.data.data.content;
}

export function getCurrentRoomAssignment(assignments: readonly StudentRoomAssignment[]): StudentRoomAssignment | null {
  return [...assignments]
    .filter((item) => item.contractStatus === 'ACTIVE' && ['ASSIGNED', 'CHECKED_IN'].includes(item.assignmentStatus))
    .sort((a, b) => b.assignedAt.localeCompare(a.assignedAt))[0] ?? null;
}
