import type { RepairCategory, RepairPriority, RepairRequest, RepairStatus } from '../types/repair';
import { apiClient, getApiErrorMessage } from './client';

interface ApiEnvelope<T> {
  code: string;
  message: string;
  data: T;
}

interface PageData<T> {
  content: T[];
  number: number;
  last: boolean;
}

interface CsrfData {
  token: string;
}

export type MaintenanceType = 'FAN' | 'AIR_CONDITIONER' | 'REFRIGERATOR' | 'LIGHTING' | 'PLUMBING' | 'FURNITURE' | 'DOOR_WINDOW' | 'OTHER';
export type MaintenanceStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED';

export interface MaintenanceDto {
  id: number;
  title: string;
  description: string;
  status: MaintenanceStatus;
  priority: RepairPriority;
  type: MaintenanceType;
  imageUrl: string | null;
  rejectionReason: string | null;
  studentId: number;
  studentName: string;
  studentCode: string;
  studentPhone: string | null;
  roomId: number;
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
}

export interface CreateMaintenanceRequest {
  title: string;
  description: string;
  priority: RepairPriority;
  type: MaintenanceType;
  roomId: number;
  imageUrl?: string;
}

export interface MaintenancePage {
  content: RepairRequest[];
  last: boolean;
  page: number;
}

function toDateParts(dateTime: string) {
  const [date, time = ''] = dateTime.split('T');
  const [year, month, day] = date.split('-');
  return { date: `${day}/${month}/${year}`, time: time.slice(0, 5) || undefined };
}

export function mapMaintenanceStatus(status: MaintenanceStatus): RepairStatus {
  if (status === 'PENDING') return 'RECEIVED';
  return status;
}

function mapMaintenanceType(type: MaintenanceType): RepairCategory {
  if (type === 'LIGHTING') return 'ELECTRIC';
  if (type === 'PLUMBING') return 'WATER';
  if (type === 'FAN') return 'FAN';
  if (type === 'REFRIGERATOR') return 'REFRIGERATOR';
  if (type === 'DOOR_WINDOW') return 'DOOR_WINDOW';
  return type;
}

export function mapMaintenance(dto: MaintenanceDto): RepairRequest {
  const created = toDateParts(dto.createdAt);
  return {
    id: String(dto.id),
    roomId: String(dto.roomId),
    title: dto.title,
    description: dto.description,
    category: mapMaintenanceType(dto.type),
    priority: dto.priority,
    status: mapMaintenanceStatus(dto.status),
    createdDate: created.date,
    createdTime: created.time,
    receivedDate: undefined,
    imageUris: dto.imageUrl ? [dto.imageUrl] : [],
    collection: dto.status === 'COMPLETED' || dto.status === 'REJECTED' ? 'history' : 'current',
    rejectionReason: dto.rejectionReason ?? undefined,
    resolvedDate: dto.resolvedAt ? toDateParts(dto.resolvedAt).date : undefined,
  };
}

function unwrap<T>(response: ApiEnvelope<T>): T {
  if (response.code !== 'SUCCESS' || response.data == null) {
    throw new Error(response.message || 'Maintenance request failed.');
  }
  return response.data;
}

export async function getMaintenanceRequests(page = 0, size = 10): Promise<MaintenancePage> {
  try {
    const response = await apiClient.get<ApiEnvelope<PageData<MaintenanceDto>>>('/student/maintenance', { params: { page, size } });
    const data = unwrap(response.data);
    return { content: data.content.map(mapMaintenance), last: data.last, page: data.number };
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Could not load maintenance requests.'));
  }
}

export async function getMaintenanceRequest(id: string): Promise<RepairRequest> {
  try {
    const response = await apiClient.get<ApiEnvelope<MaintenanceDto>>(`/student/maintenance/${encodeURIComponent(id)}`);
    return mapMaintenance(unwrap(response.data));
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Could not load maintenance request.'));
  }
}

async function getCsrfToken(): Promise<string> {
  const response = await apiClient.get<ApiEnvelope<CsrfData>>('/auth/csrf');
  const token = response.data.data?.token;
  if (!token) throw new Error('Backend did not return a CSRF token.');
  return token;
}

export async function createMaintenanceRequest(request: CreateMaintenanceRequest): Promise<RepairRequest> {
  try {
    const token = await getCsrfToken();
    const response = await apiClient.post<ApiEnvelope<MaintenanceDto>>('/student/maintenance', request, {
      headers: { 'X-XSRF-TOKEN': token },
    });
    return mapMaintenance(unwrap(response.data));
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Could not create maintenance request.'));
  }
}

export function mapRepairCategoryToMaintenanceType(category: RepairCategory): MaintenanceType {
  if (category === 'ELECTRIC') return 'LIGHTING';
  if (category === 'WATER') return 'PLUMBING';
  if (category === 'ROOM') return 'OTHER';
  if (category === 'FAN' || category === 'REFRIGERATOR' || category === 'DOOR_WINDOW') return category;
  return category;
}
