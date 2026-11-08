// The DEV panel uses the same cookie jar and CSRF state as the app auth client.
export {
  ApiError as AuthPocError,
  getConfiguredApiBaseUrl,
  getCsrf,
  loginSession as login,
  logoutSession as logout,
  refreshSession as refresh,
} from './httpClient';
export type { ApiResult as PocResult, AuthUserResponse as AuthUser } from './httpClient';
import { apiRequest } from './httpClient';
import type { AuthUserResponse } from './httpClient';

export function getMe() {
  return apiRequest<AuthUserResponse>('/api/v1/auth/me', { retryOnUnauthorized: false });
}
