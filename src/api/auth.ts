import { apiRequest, loginSession, logoutSession, refreshSession } from './httpClient';
import type { AuthUserResponse } from './httpClient';
import { ApiError } from './httpClient';
import { authDevLog } from '../utils/authDiagnostics';

export type AuthUser = AuthUserResponse;

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
