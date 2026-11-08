import { apiClient, getApiErrorMessage } from './client';

export type StudentRoomStatus = 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE' | 'RESERVED';
export type StudentRoomType = 'SINGLE' | 'DOUBLE' | 'QUAD' | 'SIX_BED' | 'EIGHT_BED';

export interface StudentRoomDto {
  roomId: number;
  roomNumber: string;
  floor: number;
  buildingId: number;
  buildingName: string;
  buildingCode: string;
  buildingAddress: string | null;
  buildingGenderRestriction: 'MALE' | 'FEMALE' | 'OTHER' | null;
  roomType: StudentRoomType;
  capacity: number;
  currentOccupancy: number;
  remainingSlots: number;
  pricePerMonth: number;
  status: StudentRoomStatus;
  description: string | null;
  availableForApplication: boolean;
  eligibleForStudent: boolean;
}

interface ApiResponse<T> { code: string; message: string; data: T | null }
interface PageResponse<T> {
  content: T[];
  number: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface StudentRoomFilters {
  search?: string;
  status?: StudentRoomStatus;
  roomType?: StudentRoomType;
  buildingId?: number;
}

export interface StudentRoomPage {
  content: readonly StudentRoomDto[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

function dataOrThrow<T>(response: ApiResponse<T>): T {
  if (response.code !== 'SUCCESS' || response.data == null) {
    throw new Error('Không thể tải thông tin phòng. Vui lòng thử lại.');
  }
  return response.data;
}

export async function getStudentRooms(filters: StudentRoomFilters = {}, page = 0, size = 20): Promise<StudentRoomPage> {
  try {
    const response = await apiClient.get<ApiResponse<PageResponse<StudentRoomDto>>>('/student/rooms', {
      params: { ...filters, page, size },
    });
    const data = dataOrThrow(response.data);
    return { content: data.content, page: data.number, size: data.size,
      totalElements: data.totalElements, totalPages: data.totalPages, last: data.last };
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Không thể tải danh sách phòng. Vui lòng thử lại.'));
  }
}

export async function getStudentRoom(roomId: number): Promise<StudentRoomDto> {
  try {
    const response = await apiClient.get<ApiResponse<StudentRoomDto>>(`/student/rooms/${roomId}`);
    return dataOrThrow(response.data);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Không thể tải thông tin phòng. Vui lòng thử lại.'));
  }
}
