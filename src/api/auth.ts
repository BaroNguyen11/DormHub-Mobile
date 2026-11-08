import axios from 'axios';

import type { AuthenticatedUser } from '../types/auth';
import { apiClient, getApiErrorMessage } from './client';

interface ApiEnvelope<T> {
  code: string;
  message: string;
  data: T;
}

interface CsrfData {
  token: string;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ResetPasswordRequest {
  email: string;
  otp: string;
  newPassword: string;
}

function unwrapUser(response: ApiEnvelope<AuthenticatedUser>): AuthenticatedUser {
  if (response.code !== 'SUCCESS' || !response.data) {
    throw new Error(response.message || 'Authentication failed.');
  }
  if (response.data.role !== 'STUDENT') {
    throw new Error('This account cannot sign in to the student app.');
  }
  if (response.data.status !== 'ACTIVE') {
    throw new Error(response.message || 'This account is not active.');
  }
  return response.data;
}

async function getCsrfToken(): Promise<string> {
  const response = await apiClient.get<ApiEnvelope<CsrfData>>('/auth/csrf');
  const token = response.data.data?.token;
  if (!token) throw new Error('Backend did not return a CSRF token.');
  return token;
}

async function postWithCsrf<T>(path: string, body?: unknown): Promise<T> {
  const token = await getCsrfToken();
  const response = await apiClient.post<T>(path, body, { headers: { 'X-XSRF-TOKEN': token } });
  return response.data;
}

export async function loginWithEmail(email: string, password: string): Promise<AuthenticatedUser> {
  try {
    const response = await postWithCsrf<ApiEnvelope<AuthenticatedUser>>(
      '/auth/login',
      { email: email.trim(), password },
    );
    return unwrapUser(response);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Sign in failed. Please try again.'));
  }
}

export async function getCurrentUser(): Promise<AuthenticatedUser> {
  const response = await apiClient.get<ApiEnvelope<AuthenticatedUser>>('/auth/me');
  return unwrapUser(response.data);
}

export async function refreshSession(): Promise<AuthenticatedUser> {
  const response = await postWithCsrf<ApiEnvelope<AuthenticatedUser>>('/auth/refresh');
  return unwrapUser(response);
}

export async function logoutFromBackend(): Promise<void> {
  const response = await postWithCsrf<ApiEnvelope<null>>('/auth/logout');
  if (response.code !== 'SUCCESS') throw new Error(response.message || 'Sign out failed.');
}

export async function changeStudentPassword(request: ChangePasswordRequest): Promise<void> {
  try {
    const response = await postWithCsrf<ApiEnvelope<null>>('/auth/change-password', request);
    if (response.code !== 'SUCCESS') throw new Error(response.message || 'Password change failed.');
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Password change failed. Please try again.'));
  }
}

export async function requestPasswordReset(email: string): Promise<void> {
  try {
    const response = await postWithCsrf<ApiEnvelope<null>>('/auth/forgot-password', { email: email.trim() });
    if (response.code !== 'SUCCESS') throw new Error(response.message || 'Could not send the OTP.');
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Could not send the OTP. Please try again.'));
  }
}

export async function resetStudentPassword(request: ResetPasswordRequest): Promise<void> {
  try {
    const response = await postWithCsrf<ApiEnvelope<null>>('/auth/reset-password', request);
    if (response.code !== 'SUCCESS') throw new Error(response.message || 'Could not reset the password.');
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Could not reset the password. Please try again.'));
  }
}

export function isUnauthorizedAuthError(error: unknown): boolean {
  return axios.isAxiosError(error) && error.response?.status === 401;
}
