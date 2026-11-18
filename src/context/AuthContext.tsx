import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { PropsWithChildren } from 'react';
import { getMe, login, logout } from '../api/auth';
import type { AuthUser } from '../api/auth';
import { ApiError } from '../api/httpClient';
import { authDevLog } from '../utils/authDiagnostics';

type AuthState =
  | { status: 'loading'; user: null }
  | { status: 'unauthenticated'; user: null }
  | { status: 'authenticated'; user: AuthUser };

type AuthContextValue = AuthState & {
  sessionError: string | null;
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
  const [sessionError, setSessionError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    getMe().then((result) => {
      if (!mounted) return;
      setSessionError(null);
      setState(isActiveStudent(result.data)
        ? { status: 'authenticated', user: result.data }
        : { status: 'unauthenticated', user: null });
    }).catch((cause: unknown) => {
      if (mounted) {
        setSessionError(cause instanceof Error ? cause.message : 'Không thể xác nhận phiên đăng nhập.');
        setState({ status: 'unauthenticated', user: null });
      }
    });
    return () => { mounted = false; };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    authDevLog('signIn started');
    setSessionError(null);
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
    setSessionError(null);
    setState({ status: 'authenticated', user: verified.data });
    authDevLog('Auth state updated: authenticated');
  }, []);

  const signOut = useCallback(async () => {
    await logout();
    setState({ status: 'unauthenticated', user: null });
    authDevLog('Auth state updated: unauthenticated');
  }, []);

  const recheckSession = useCallback(async () => {
    try {
      const result = await getMe();
      setSessionError(null);
      setState(isActiveStudent(result.data)
        ? { status: 'authenticated', user: result.data }
        : { status: 'unauthenticated', user: null });
    } catch (cause) {
      setSessionError(cause instanceof Error ? cause.message : 'Không thể xác nhận phiên đăng nhập.');
      setState({ status: 'unauthenticated', user: null });
    }
  }, []);

  return <AuthContext.Provider value={{ ...state, sessionError, signIn, signOut, recheckSession }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('AuthProvider is missing');
  return value;
}
