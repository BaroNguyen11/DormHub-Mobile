import { fetch as expoFetch } from 'expo/fetch';
import { authDevLog } from '../utils/authDiagnostics';

export interface ApiResponse<T> {
  code: string;
  message: string;
  data: T;
}

export interface ApiResult<T> {
  httpStatus: number;
  data: T;
  csrfReady?: boolean;
}

export class ApiError extends Error {
  constructor(
    message: string,
    readonly httpStatus: number | null = null,
    readonly code: string | null = null,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
interface RequestOptions {
  method?: Method;
  body?: object;
  csrf?: boolean;
  retryOnUnauthorized?: boolean;
}

let csrfToken: string | null = null;
let csrfInFlight: Promise<ApiResult<null>> | null = null;
let refreshInFlight: Promise<ApiResult<AuthUserResponse>> | null = null;

export interface AuthUserResponse {
  userId: number;
  username: string;
  email: string;
  fullName: string;
  role: string;
  status: string;
}

function apiBaseUrl(): string {
  const configured = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();
  if (!configured) throw new ApiError('Thiếu EXPO_PUBLIC_API_BASE_URL.');
  let url: URL;
  try {
    url = new URL(configured);
  } catch {
    throw new ApiError('EXPO_PUBLIC_API_BASE_URL không phải URL hợp lệ.');
  }
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.search || url.hash || url.pathname !== '/') {
    throw new ApiError('API URL phải là origin http(s), không chứa path, tài khoản hoặc query.');
  }
  if (['localhost', '127.0.0.1', '::1', '[::1]'].includes(url.hostname.toLowerCase())) {
    throw new ApiError('Không dùng localhost. Hãy dùng địa chỉ Backend mà thiết bị truy cập được.');
  }
  return url.origin;
}

export function getConfiguredApiBaseUrl(): string | null {
  try { return apiBaseUrl(); } catch { return null; }
}

async function sendOnce<T>(path: string, options: RequestOptions): Promise<ApiResult<T>> {
  const baseUrl = apiBaseUrl();
  const isChangePassword = path === '/api/v1/auth/change-password';
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (options.body) headers['Content-Type'] = 'application/json';
  if (options.csrf) {
    if (!csrfToken) throw new ApiError('Chưa lấy được CSRF token.');
    headers['X-XSRF-TOKEN'] = csrfToken;
    if (path === '/api/v1/auth/logout') authDevLog('Logout CSRF header attached');
    if (isChangePassword) authDevLog('Change password CSRF header attached');
  }

  let response: Awaited<ReturnType<typeof expoFetch>>;
  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  const deadline = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      controller.abort();
      reject(new ApiError('Yêu cầu quá thời gian chờ. Vui lòng thử lại.'));
    }, 15000);
  });
  let payload: unknown;
  try {
    try {
      response = await Promise.race([expoFetch(`${baseUrl}${path}`, {
        method: options.method ?? 'GET',
        headers,
        credentials: 'include',
        signal: controller.signal,
        ...(options.body ? { body: JSON.stringify(options.body) } : {}),
      }), deadline]);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Không kết nối được Backend. Kiểm tra địa chỉ API và mạng.');
    }
    if (path === '/api/v1/auth/login') authDevLog('Login HTTP status', response.status);
    if (path === '/api/v1/auth/logout') authDevLog('Logout HTTP status', response.status);
    if (isChangePassword) authDevLog('Change password HTTP status', response.status);
    if (path === '/api/v1/auth/me') authDevLog('/auth/me HTTP status', response.status);
    if (path === '/api/v1/auth/csrf') {
      authDevLog(response.headers.has('set-cookie')
        ? 'CSRF Set-Cookie header exposed'
        : 'CSRF Set-Cookie header not exposed');
    }
    try {
      payload = await Promise.race([response.json(), deadline]);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      if (path === '/api/v1/auth/logout' && response.status === 403) authDevLog('Logout 403 response: invalid JSON');
      if (isChangePassword && response.status === 403) authDevLog('Change password 403 response: invalid JSON');
      throw new ApiError('Backend không trả JSON hợp lệ.', response.status);
    }
  } finally {
    if (timer) clearTimeout(timer);
  }
  if (!payload || typeof payload !== 'object' || !('code' in payload) || !('message' in payload) || !('data' in payload)) {
    if (path === '/api/v1/auth/logout' && response.status === 403) authDevLog('Logout 403 response: invalid ApiResponse');
    if (isChangePassword && response.status === 403) authDevLog('Change password 403 response: invalid ApiResponse');
    throw new ApiError('Response không đúng dạng ApiResponse.', response.status);
  }
  const api = payload as ApiResponse<T>;
  if (typeof api.code !== 'string' || typeof api.message !== 'string') {
    if (path === '/api/v1/auth/logout' && response.status === 403) authDevLog('Logout 403 response: invalid ApiResponse');
    if (isChangePassword && response.status === 403) authDevLog('Change password 403 response: invalid ApiResponse');
    throw new ApiError('Response không đúng dạng ApiResponse.', response.status);
  }
  if (path === '/api/v1/auth/logout' && response.status === 403) {
    authDevLog(api.code === 'ACCESS_DENIED'
      ? 'Logout 403 response: ACCESS_DENIED'
      : 'Logout 403 response: other API code');
  }
  if (isChangePassword && response.status === 403) {
    authDevLog(api.code === 'ACCESS_DENIED'
      ? 'Change password 403 response: ACCESS_DENIED'
      : 'Change password 403 response: other API code');
  }
  if (!response.ok || api.code !== 'SUCCESS') {
    throw new ApiError(api.message || `HTTP ${response.status}`, response.status, api.code);
  }
  return { httpStatus: response.status, data: api.data };
}

export function getCsrf(): Promise<ApiResult<null>> {
  if (csrfInFlight) return csrfInFlight;
  csrfInFlight = (async () => {
    authDevLog('CSRF request started');
    csrfToken = null;
    try {
      const result = await sendOnce<{ token: string }>('/api/v1/auth/csrf', { method: 'GET' });
      if (!result.data || typeof result.data.token !== 'string' || !result.data.token) {
        throw new ApiError('Backend không trả CSRF token.', result.httpStatus);
      }
      csrfToken = result.data.token;
      authDevLog('CSRF request completed', result.httpStatus);
      return { httpStatus: result.httpStatus, data: null, csrfReady: true };
    } catch (error) {
      authDevLog('CSRF request failed', error instanceof ApiError ? error.httpStatus ?? undefined : undefined);
      throw error;
    }
  })().finally(() => { csrfInFlight = null; });
  return csrfInFlight;
}

async function ensureCsrf(): Promise<void> {
  if (!csrfToken) await getCsrf();
}

async function renewCsrfAfterAuth(): Promise<boolean> {
  csrfToken = null;
  try { await getCsrf(); return true; } catch { return false; }
}

export function refreshSession(): Promise<ApiResult<AuthUserResponse>> {
  if (refreshInFlight) return refreshInFlight;
  refreshInFlight = (async () => {
    await ensureCsrf();
    const result = await sendOnce<AuthUserResponse>('/api/v1/auth/refresh', { method: 'POST', csrf: true });
    return { ...result, csrfReady: await renewCsrfAfterAuth() };
  })().finally(() => { refreshInFlight = null; });
  return refreshInFlight;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<ApiResult<T>> {
  if (options.csrf) await ensureCsrf();
  try {
    return await sendOnce<T>(path, options);
  } catch (error) {
    if (!(error instanceof ApiError) || error.httpStatus !== 401 || options.retryOnUnauthorized === false) throw error;
    await refreshSession();
    if (options.csrf) await ensureCsrf();
    return sendOnce<T>(path, { ...options, retryOnUnauthorized: false });
  }
}

export async function loginSession(email: string, password: string): Promise<ApiResult<AuthUserResponse>> {
  const result = await apiRequest<AuthUserResponse>('/api/v1/auth/login', {
    method: 'POST', body: { email: email.trim(), password }, csrf: true, retryOnUnauthorized: false,
  });
  const csrfReady = await renewCsrfAfterAuth();
  authDevLog(csrfReady ? 'Login CSRF renewal ready' : 'Login CSRF renewal unavailable');
  return { ...result, csrfReady };
}

export async function logoutSession(): Promise<ApiResult<null>> {
  authDevLog(csrfToken ? 'Logout CSRF memory present' : 'Logout CSRF memory empty');
  const result = await apiRequest<null>('/api/v1/auth/logout', {
    method: 'POST', csrf: true, retryOnUnauthorized: false,
  });
  const csrfReady = await renewCsrfAfterAuth();
  authDevLog(csrfReady ? 'Logout CSRF renewal ready' : 'Logout CSRF renewal unavailable');
  return { ...result, csrfReady };
}
