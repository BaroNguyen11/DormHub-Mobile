import { apiRequest, loginSession, logoutSession, refreshSession } from './httpClient';
import type { AuthUserResponse } from './httpClient';
import { ApiError } from './httpClient';
import { authDevLog } from '../utils/authDiagnostics';

export type AuthUser = AuthUserResponse;

export function registerAccount(body: { username: string; email: string; password: string; fullName: string; phoneNumber: string; studentCode: string }) {
  return apiRequest<{ userId: number; username: string; email: string; fullName: string; status: string }>('/api/v1/auth/register', { method: 'POST', body, retryOnUnauthorized: false });
}

export function requestPasswordReset(email: string) {
  return apiRequest<null>('/api/v1/auth/forgot-password', { method: 'POST', body: { email: email.trim() }, retryOnUnauthorized: false });
}

export function resendActivationOtp(email: string) {
  return apiRequest<null>('/api/v1/auth/resend-otp', { method: 'POST', body: { email: email.trim() }, retryOnUnauthorized: false });
}

export function verifyActivationOtp(email: string, otp: string) {
  return apiRequest<null>('/api/v1/auth/verify-email', { method: 'POST', body: { email: email.trim(), otp: otp.trim() }, retryOnUnauthorized: false });
}

export function resetPassword(email: string, otp: string, newPassword: string) {
  return apiRequest<null>('/api/v1/auth/reset-password', { method: 'POST', body: { email: email.trim(), otp, newPassword }, retryOnUnauthorized: false });
}

export async function login(email: string, password: string) {
  try {
    return await loginSession(email, password);
  } catch (error) {
    authDevLog('Login request failed', error instanceof ApiError ? error.httpStatus ?? undefined : undefined);
    throw error;
  }
}

export async function getMe(retryOnUnauthorized = true) {
  try {
    return await apiRequest<AuthUser>('/api/v1/auth/me', { retryOnUnauthorized });
  } catch (error) {
    authDevLog('/auth/me request failed', error instanceof ApiError ? error.httpStatus ?? undefined : undefined);
    throw error;
  }
}

export function refresh() {
  return refreshSession();
}

export async function changePassword(oldPassword: string, newPassword: string, confirmPassword: string) {
  authDevLog('Change password started: STUDENT ACTIVE');
  try {
    return await apiRequest<null>('/api/v1/auth/change-password', {
      method: 'POST', body: { oldPassword, newPassword, confirmPassword }, csrf: true,
      retryOnUnauthorized: false,
    });
  } catch (error) {
    authDevLog('Change password request failed', error instanceof ApiError ? error.httpStatus ?? undefined : undefined);
    throw error;
  }
}

export async function logout() {
  authDevLog('Logout started');
  try {
    return await logoutSession();
  } catch (error) {
    authDevLog('Logout request failed', error instanceof ApiError ? error.httpStatus ?? undefined : undefined);
    throw error;
  }
}
