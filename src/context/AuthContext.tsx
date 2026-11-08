import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { PropsWithChildren } from 'react';
import { getMe, login, logout } from '../api/auth';
import type { AuthUser } from '../api/auth';
import { ApiError } from '../api/httpClient';
import { useMockAccount } from './MockAccountContext';
import { authDevLog } from '../utils/authDiagnostics';

type AuthState =
  | { status: 'loading'; user: null }
  | { status: 'unauthenticated'; user: null }
  | { status: 'authenticated'; user: AuthUser };

type AuthContextValue = AuthState & {
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  recheckSession: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function isActiveStudent(user: AuthUser | null | undefined): user is AuthUser {
  return !!user && typeof user.userId === 'number' && user.role === 'STUDENT' && user.status === 'ACTIVE';
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState<AuthState>({ status: 'loading', user: null });
  const { logout: clearPreview } = useMockAccount();

  useEffect(() => {
    let mounted = true;
    getMe().then((result) => {
      if (!mounted) return;
      if (isActiveStudent(result.data)) clearPreview();
      setState(isActiveStudent(result.data)
        ? { status: 'authenticated', user: result.data }
        : { status: 'unauthenticated', user: null });
    }).catch(() => {
      if (mounted) setState({ status: 'unauthenticated', user: null });
    });
    return () => { mounted = false; };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    authDevLog('signIn started');
    const result = await login(email, password);
    if (!isActiveStudent(result.data)) {
      authDevLog('Navigation ineligible: student');
      try { await logout(); } catch { /* Navigation remains unauthenticated. */ }
      throw new ApiError('Chỉ tài khoản sinh viên đang hoạt động được sử dụng ứng dụng này.', 403);
    }
    const verified = await getMe(false);
    if (!isActiveStudent(verified.data) || verified.data.userId !== result.data.userId) {
      authDevLog('Navigation ineligible: student');
      throw new ApiError('Không xác nhận được phiên đăng nhập sinh viên.');
    }
    authDevLog('Navigation eligible: student');
    clearPreview();
    setState({ status: 'authenticated', user: verified.data });
    authDevLog('Auth state updated: authenticated');
  }, [clearPreview]);

  const signOut = useCallback(async () => {
    await logout();
    setState({ status: 'unauthenticated', user: null });
    authDevLog('Auth state updated: unauthenticated');
  }, []);

  const recheckSession = useCallback(async () => {
    try {
      const result = await getMe();
      if (isActiveStudent(result.data)) clearPreview();
      setState(isActiveStudent(result.data)
        ? { status: 'authenticated', user: result.data }
        : { status: 'unauthenticated', user: null });
    } catch {
      setState({ status: 'unauthenticated', user: null });
    }
  }, [clearPreview]);

  return <AuthContext.Provider value={{ ...state, signIn, signOut, recheckSession }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('AuthProvider is missing');
  return value;
}
