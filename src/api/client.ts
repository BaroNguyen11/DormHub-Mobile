import axios from 'axios';

interface ApiErrorEnvelope {
  message?: string;
}

const configuredBaseUrl = (process.env.EXPO_PUBLIC_API_BASE_URL || process.env.EXPO_PUBLIC_API_URL)?.trim();
const baseURL = configuredBaseUrl
  ? `${configuredBaseUrl.replace(/\/$/, '').replace(/\/api\/v1$/, '')}/api/v1`
  : 'http://localhost:8080/api/v1';

export const apiClient = axios.create({
  baseURL,
  timeout: 15000,
  withCredentials: true,
  withXSRFToken: true,
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',
  headers: { 'Content-Type': 'application/json' },
});

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError<ApiErrorEnvelope>(error)) {
    if (!error.response) return 'Không thể kết nối. Vui lòng kiểm tra mạng và thử lại.';
    if (error.response.status === 401) return 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
    if (error.response.status === 403) return 'Không thể thực hiện thao tác này. Vui lòng thử lại sau.';
    if (error.response.status === 400) return 'Thông tin chưa hợp lệ. Vui lòng kiểm tra và thử lại.';
  }
  return 'Không thể thực hiện yêu cầu. Vui lòng thử lại sau.';
}
