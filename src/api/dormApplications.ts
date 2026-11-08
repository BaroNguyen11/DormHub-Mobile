import { apiClient, getApiErrorMessage } from './client';

interface ApiEnvelope<T> {
  code: string;
  message: string;
  data: T;
}

interface PageData<T> {
  content: T[];
  number?: number;
  page?: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first?: boolean;
  last?: boolean;
  empty?: boolean;
}

interface CsrfData {
  token: string;
}

export type DormApplicationStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export interface DormApplicationDto {
  id: number;
  studentId: number;
  studentCode: string;
  studentName: string;
  studentGender: 'MALE' | 'FEMALE';
  requestedRoomId: number;
  requestedRoomNumber: string;
  requestedBuildingId: number;
  requestedBuildingName: string;
  requestDate: string;
  status: DormApplicationStatus;
  note: string | null;
  reviewNote: string | null;
  processedAt: string | null;
  createdAt: string;
  updatedAt: string;
  contractId: number | null;
  depositInvoiceId: number | null;
  contractStartDate: string | null;
  contractEndDate: string | null;
  depositAmount: number | null;
}

export interface DormApplicationPage {
  content: readonly DormApplicationDto[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

function unwrap<T>(response: ApiEnvelope<T>): T {
  if (response.code !== 'SUCCESS' || response.data == null) {
    throw new Error(response.message || 'Dorm application request failed.');
  }
  return response.data;
}

async function getCsrfToken(): Promise<string> {
  const response = await apiClient.get<ApiEnvelope<CsrfData>>('/auth/csrf');
  const token = response.data.data?.token;
  if (!token) throw new Error('Backend did not return a CSRF token.');
  return token;
}

async function patchWithCsrf<T>(path: string, body?: unknown): Promise<T> {
  const token = await getCsrfToken();
  const response = await apiClient.patch<T>(path, body, { headers: { 'X-XSRF-TOKEN': token } });
  return response.data;
}

export async function getStudentDormApplications(page = 0, size = 20): Promise<DormApplicationPage> {
  try {
    const response = await apiClient.get<ApiEnvelope<PageData<DormApplicationDto>>>('/student/dorm-applications', { params: { page, size: Math.min(Math.max(size, 1), 100) } });
    const data = unwrap(response.data);
    return { content: data.content, page: data.page ?? data.number ?? page, size: data.size, totalElements: data.totalElements, totalPages: data.totalPages };
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Could not load dorm applications.'));
  }
}

export async function getStudentDormApplication(id: number): Promise<DormApplicationDto> {
  try {
    const response = await apiClient.get<ApiEnvelope<DormApplicationDto>>(`/student/dorm-applications/${id}`);
    return unwrap(response.data);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Could not load dorm application.'));
  }
}

export async function createStudentDormApplication(roomId: number, note?: string): Promise<DormApplicationDto> {
  try {
    const token = await getCsrfToken();
    const response = await apiClient.post<ApiEnvelope<DormApplicationDto>>('/student/dorm-applications', { roomId, ...(note?.trim() ? { note: note.trim() } : {}) }, { headers: { 'X-XSRF-TOKEN': token } });
    return unwrap(response.data);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Could not submit dorm application.'));
  }
}

export async function changeStudentDormApplicationRoom(id: number, roomId: number): Promise<void> {
  try {
    const response = await patchWithCsrf<ApiEnvelope<unknown>>(`/student/dorm-applications/${id}/room`, { roomId });
    if (response.code !== 'SUCCESS') throw new Error(response.message || 'Could not change requested room.');
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Could not change requested room.'));
  }
}

export async function cancelStudentDormApplication(id: number): Promise<void> {
  try {
    const response = await patchWithCsrf<ApiEnvelope<null>>(`/student/dorm-applications/${id}/cancel`);
    if (response.code !== 'SUCCESS') throw new Error(response.message || 'Could not cancel dorm application.');
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Could not cancel dorm application.'));
  }
}
