import type { StudentProfileDto, StudentProfileUpdate } from '../types/profile';
import { apiClient, getApiErrorMessage } from './client';

interface ApiEnvelope<T> {
  code: string;
  message: string;
  data: T;
}

interface CsrfData {
  token: string;
}

async function getCsrfToken(): Promise<string> {
  const response = await apiClient.get<ApiEnvelope<CsrfData>>('/auth/csrf');
  const token = response.data.data?.token;
  if (!token) throw new Error('Backend did not return a CSRF token.');
  return token;
}

function unwrapProfile(response: ApiEnvelope<StudentProfileDto>): StudentProfileDto {
  if (response.code !== 'SUCCESS' || !response.data) {
    throw new Error(response.message || 'Could not load the student profile.');
  }
  return response.data;
}

export async function getStudentProfile(): Promise<StudentProfileDto> {
  try {
    const response = await apiClient.get<ApiEnvelope<StudentProfileDto>>('/student/profile');
    return unwrapProfile(response.data);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Could not load the student profile.'));
  }
}

export async function patchStudentProfile(update: StudentProfileUpdate): Promise<StudentProfileDto> {
  try {
    const token = await getCsrfToken();
    const response = await apiClient.patch<ApiEnvelope<StudentProfileDto>>('/student/profile', update, {
      headers: { 'X-XSRF-TOKEN': token },
    });
    return unwrapProfile(response.data);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Could not update the student profile.'));
  }
}
