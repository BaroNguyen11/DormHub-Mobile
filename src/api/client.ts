import axios from 'axios';

interface ApiErrorEnvelope {
  message?: string;
}

const configuredBaseUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
const baseURL = (configuredBaseUrl || 'http://localhost:8080/api/v1').replace(/\/$/, '');

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
    const message = error.response?.data?.message;
    if (message) return message;
    if (!error.response) return 'Không kết nối được backend. Hãy kiểm tra server, địa chỉ API và cấu hình CORS.';
  }
  return error instanceof Error ? error.message : fallback;
}
