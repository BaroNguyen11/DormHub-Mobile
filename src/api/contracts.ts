import { apiClient, getApiErrorMessage } from './client';

interface ApiEnvelope<T> {
  code: string;
  message: string;
  data: T;
}

interface ContractPageData<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface StudentContractDto {
  contractId: number;
  roomId: number;
  studentId: number;
  startDate: string;
  endDate: string;
  monthlyRent: number;
  depositAmount: number;
  status: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface StudentContractPage {
  content: readonly StudentContractDto[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

function unwrap<T>(response: ApiEnvelope<T>): T {
  if (response.code !== 'SUCCESS' || response.data == null) {
    throw new Error(response.message || 'Contract request failed.');
  }
  return response.data;
}

export async function getStudentContracts(page = 0, size = 20, status?: string): Promise<StudentContractPage> {
  try {
    const response = await apiClient.get<ApiEnvelope<ContractPageData<StudentContractDto>>>('/student/contracts', {
      params: { page, size, ...(status ? { status } : {}) },
    });
    const data = unwrap(response.data);
    return { content: data.content, page: data.number, size: data.size, totalElements: data.totalElements, totalPages: data.totalPages, first: data.first, last: data.last, empty: data.empty };
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Could not load student contracts.'));
  }
}

export async function getStudentContract(id: number): Promise<StudentContractDto> {
  try {
    const response = await apiClient.get<ApiEnvelope<StudentContractDto>>(`/student/contracts/${id}`);
    return unwrap(response.data);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Could not load contract details.'));
  }
}
