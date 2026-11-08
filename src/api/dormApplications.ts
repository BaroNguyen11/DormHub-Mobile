import axios from 'axios';
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

const applicationErrors: Readonly<Record<string, string>> = {
  STUDENT_PROFILE_INCOMPLETE: 'Vui lòng hoàn thiện hồ sơ sinh viên trước khi đăng ký phòng.',
  DORM_APPLICATION_GENDER_UNSUPPORTED: 'Hồ sơ giới tính chưa phù hợp để đăng ký phòng.',
  ROOM_GENDER_POLICY_REQUIRED: 'Phòng này tạm thời chưa thể đăng ký.',
  ROOM_GENDER_POLICY_MISMATCH: 'Phòng này không phù hợp với giới tính trong hồ sơ của bạn.',
  ROOM_FULL: 'Phòng đã hết chỗ. Vui lòng chọn phòng khác.',
  ROOM_NOT_AVAILABLE: 'Phòng này hiện không thể đăng ký.',
  ROOM_NOT_FOUND: 'Không tìm thấy phòng đã chọn.',
  DORM_APPLICATION_ALREADY_ACTIVE: 'Bạn đã có đơn đăng ký đang được xử lý.',
  DORM_APPLICATION_ROOM_REQUIRED: 'Vui lòng chọn phòng trước khi đăng ký.',
  DORM_APPLICATION_NOT_PENDING: 'Chỉ có thể thay đổi hoặc hủy đơn đang chờ duyệt.',
};

function applicationErrorMessage(error: unknown): string {
  if (axios.isAxiosError<ApiEnvelope<unknown>>(error)) {
    const code = error.response?.data?.code;
    if (code && Object.prototype.hasOwnProperty.call(applicationErrors, code)) return applicationErrors[code];
    if (error.response?.status === 409) return 'Thông tin phòng hoặc đơn đăng ký đã thay đổi. Vui lòng tải lại và thử lại.';
  }
  return getApiErrorMessage(error, 'Không thể xử lý đơn đăng ký. Vui lòng thử lại.');
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
    throw new Error(applicationErrorMessage(error));
  }
}

export async function changeStudentDormApplicationRoom(id: number, roomId: number): Promise<DormApplicationDto> {
  try {
    const response = await patchWithCsrf<ApiEnvelope<DormApplicationDto>>(`/student/dorm-applications/${id}/room`, { roomId });
    return unwrap(response);
  } catch (error) {
    throw new Error(applicationErrorMessage(error));
  }
}

export async function cancelStudentDormApplication(id: number): Promise<DormApplicationDto> {
  try {
    const response = await patchWithCsrf<ApiEnvelope<DormApplicationDto>>(`/student/dorm-applications/${id}/cancel`);
    return unwrap(response);
  } catch (error) {
    throw new Error(applicationErrorMessage(error));
  }
}
