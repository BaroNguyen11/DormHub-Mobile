import axios from 'axios';

import type { AuthenticatedUser } from '../types/auth';
import { apiClient, getApiErrorMessage } from './client';

interface ApiEnvelope<T> {
  code: string;
  message: string;
  data: T;
}

interface RecoveryErrorEnvelope {
  code?: string;
}

function recoveryErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError<RecoveryErrorEnvelope>(error)) {
    switch (error.response?.data?.code) {
      case 'OTP_INVALID': return 'Mã OTP không đúng. Vui lòng kiểm tra và thử lại.';
      case 'OTP_EXPIRED': return 'Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới.';
      case 'OTP_ALREADY_USED': return 'Mã OTP đã được sử dụng. Vui lòng yêu cầu mã mới.';
      case 'OTP_MAX_ATTEMPTS': return 'Bạn đã nhập sai quá số lần cho phép. Vui lòng yêu cầu mã mới.';
      case 'ACCOUNT_NOT_ACTIVE': return 'Không thể đặt lại mật khẩu cho tài khoản này. Vui lòng liên hệ nhà trường.';
    }
  }
  return getApiErrorMessage(error, fallback);
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
    throw new Error('Không thể xác thực tài khoản. Vui lòng thử lại.');
  }
  if (response.data.role !== 'STUDENT') {
    throw new StudentAccessError('Tài khoản này không thể sử dụng ứng dụng sinh viên.');
  }
  if (response.data.status !== 'ACTIVE') {
    throw new StudentAccessError('Tài khoản chưa được kích hoạt. Vui lòng liên hệ nhà trường.');
  }
  return response.data;
}

class StudentAccessError extends Error {}

async function getCsrfToken(): Promise<string> {
  try {
    const response = await apiClient.get<ApiEnvelope<CsrfData>>('/auth/csrf');
    const token = response.data.data?.token;
    if (!token) throw new Error('Không thể xác thực yêu cầu. Vui lòng thử lại.');
    if (__DEV__) console.info('[auth] GET /auth/csrf', response.status);
    return token;
  } catch (error) {
    if (__DEV__) console.info('[auth] GET /auth/csrf failed', axios.isAxiosError(error) ? error.response?.status ?? 'network' : 'invalid response');
    throw error;
  }
}

async function postWithCsrf<T>(path: string, body?: unknown): Promise<T> {
  const token = await getCsrfToken();
  try {
    const response = await apiClient.post<T>(path, body, { headers: { 'X-XSRF-TOKEN': token } });
    if (__DEV__) console.info('[auth] POST', path, response.status);
    return response.data;
  } catch (error) {
    if (__DEV__) console.info('[auth] POST failed', path, axios.isAxiosError(error) ? error.response?.status ?? 'network' : 'invalid response');
    throw error;
  }
}

export async function loginWithEmail(email: string, password: string): Promise<AuthenticatedUser> {
  try {
    const response = await postWithCsrf<ApiEnvelope<AuthenticatedUser>>(
      '/auth/login',
      { email: email.trim(), password },
    );
    return unwrapUser(response);
  } catch (error) {
    if (error instanceof StudentAccessError) throw error;
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
  if (response.code !== 'SUCCESS') throw new Error('Không thể đăng xuất. Vui lòng thử lại.');
}

export async function changeStudentPassword(request: ChangePasswordRequest): Promise<void> {
  try {
    const response = await postWithCsrf<ApiEnvelope<null>>('/auth/change-password', request);
    if (response.code !== 'SUCCESS') throw new Error('Không thể đổi mật khẩu. Vui lòng thử lại.');
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Password change failed. Please try again.'));
  }
}

export async function requestPasswordReset(email: string): Promise<void> {
  try {
    const response = await postWithCsrf<ApiEnvelope<null>>('/auth/forgot-password', { email: email.trim() });
    if (response.code !== 'SUCCESS') throw new Error('Không thể gửi mã xác nhận. Vui lòng thử lại.');
  } catch (error) {
    throw new Error(recoveryErrorMessage(error, 'Không thể gửi yêu cầu. Vui lòng thử lại.'));
  }
}

export async function resetStudentPassword(request: ResetPasswordRequest): Promise<void> {
  try {
    const response = await postWithCsrf<ApiEnvelope<null>>('/auth/reset-password', request);
    if (response.code !== 'SUCCESS') throw new Error('Không thể đặt lại mật khẩu. Vui lòng thử lại.');
  } catch (error) {
    throw new Error(recoveryErrorMessage(error, 'Không thể đặt lại mật khẩu. Vui lòng thử lại.'));
  }
}

export function isUnauthorizedAuthError(error: unknown): boolean {
  return axios.isAxiosError(error) && error.response?.status === 401;
}
