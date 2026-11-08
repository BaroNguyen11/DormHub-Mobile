import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { PropsWithChildren } from 'react';
import { changeStudentPassword, getCurrentUser, isUnauthorizedAuthError, loginWithEmail, logoutFromBackend, refreshSession, requestPasswordReset as requestPasswordResetApi, resetStudentPassword } from '../api/auth';
import { getStudentProfile, patchStudentProfile } from '../api/profile';
import { getCurrentRoomAssignment, getStudentRoomAssignments } from '../api/roomAssignments';
import type { AuthenticatedUser, LoginForm } from '../types/auth';
import type { AccountProfile, StudentProfileDto, StudentProfileUpdate } from '../types/profile';
import { useNotifications } from './NotificationContext';
import { useRepairs } from './RepairContext';
import { useResidence } from './ResidenceContext';

interface AccountContextValue {
  isAuthenticated: boolean;
  isSessionInitializing: boolean;
  profile: AccountProfile | null;
  authenticate: (form: LoginForm) => Promise<AuthenticatedUser>;
  refreshProfile: () => Promise<StudentProfileDto | undefined>;
  saveStudentProfile: (update: StudentProfileUpdate) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  resetPassword: (email: string, otp: string, newPassword: string) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  logout: () => Promise<boolean>;
  activateAuthenticatedAccount: (user: AuthenticatedUser) => Promise<void>;
}
const AccountContext = createContext<AccountContextValue | null>(null);

function toAccountProfile(profile: StudentProfileDto): AccountProfile {
  return {
    accountId: String(profile.studentId), fullName: profile.fullName,
    studentId: profile.studentCode, email: profile.email,
    phone: profile.phone ?? '', avatarUri: profile.avatarUrl,
    cic: profile.cic,
  };
}

export function MockAccountProvider({ children }: PropsWithChildren) {
  const { setStatus, setBackendRoom, refreshBackendApplications, clearBackendApplications } = useResidence();
  const { resetForAccount: resetRepairs } = useRepairs();
  const { resetForAccount: resetNotifications } = useNotifications();
  const [authenticatedUser, setAuthenticatedUser] = useState<AuthenticatedUser | null>(null);
  const [profile, setProfile] = useState<AccountProfile | null>(null);
  const [isSessionInitializing, setIsSessionInitializing] = useState(true);
  const sessionRestoreRef = useRef<Promise<AuthenticatedUser | null> | null>(null);

  const activateAuthenticatedAccount = useCallback(async (user: AuthenticatedUser) => {
    clearBackendApplications();
    resetRepairs('none');
    resetNotifications(true);
    setStatus('none');
    setBackendRoom(null);
    setAuthenticatedUser(user);
    setProfile({ accountId: String(user.userId), fullName: user.fullName, studentId: null, email: user.email, phone: '', avatarUri: null, cic: null });
    try {
      const assignments = await getStudentRoomAssignments(0, 20);
      const currentAssignment = getCurrentRoomAssignment(assignments);
      if (currentAssignment) {
        setBackendRoom(currentAssignment);
        resetRepairs('active');
      } else {
        await refreshBackendApplications();
      }
    } catch {
      // Authentication remains valid if residence data cannot be loaded.
    }
  }, [clearBackendApplications, resetRepairs, resetNotifications, refreshBackendApplications, setBackendRoom, setStatus]);

  useEffect(() => {
    let active = true;
    if (!sessionRestoreRef.current) {
      sessionRestoreRef.current = (async () => {
        try { return await getCurrentUser(); }
        catch (error) {
          if (!isUnauthorizedAuthError(error)) return null;
          try { return await refreshSession(); } catch { return null; }
        }
      })();
    }
    void sessionRestoreRef.current.then(async (user) => {
      if (active && user) await activateAuthenticatedAccount(user);
    }).finally(() => { if (active) setIsSessionInitializing(false); });
    return () => { active = false; };
  }, [activateAuthenticatedAccount]);

  const authenticate = useCallback((form: LoginForm) => loginWithEmail(form.identifier, form.password), []);
  const requestPasswordReset = useCallback((email: string) => requestPasswordResetApi(email), []);
  const resetPassword = useCallback((email: string, otp: string, newPassword: string) =>
    resetStudentPassword({ email: email.trim(), otp, newPassword }), []);
  const refreshProfile = useCallback(async () => {
    if (!authenticatedUser) return;
    const latest = await getStudentProfile();
    setProfile(toAccountProfile(latest));
    return latest;
  }, [authenticatedUser]);
  const saveStudentProfile = useCallback(async (update: StudentProfileUpdate) => {
    if (!authenticatedUser) throw new Error('Bạn cần đăng nhập để cập nhật hồ sơ.');
    setProfile(toAccountProfile(await patchStudentProfile(update)));
  }, [authenticatedUser]);
  const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    if (!authenticatedUser) throw new Error('Bạn cần đăng nhập để đổi mật khẩu.');
    await changeStudentPassword({ oldPassword: currentPassword, newPassword, confirmPassword: newPassword });
  }, [authenticatedUser]);
  const logout = useCallback(async (): Promise<boolean> => {
    let serverLogoutSucceeded = true;
    if (authenticatedUser) {
      try { await logoutFromBackend(); } catch { serverLogoutSucceeded = false; }
    }
    clearBackendApplications();
    resetRepairs('none');
    resetNotifications(false);
    setStatus('none');
    setAuthenticatedUser(null);
    setProfile(null);
    return serverLogoutSucceeded;
  }, [authenticatedUser, clearBackendApplications, resetRepairs, resetNotifications, setStatus]);

  return <AccountContext.Provider value={{ isAuthenticated: Boolean(authenticatedUser), isSessionInitializing, profile, authenticate, refreshProfile, saveStudentProfile, requestPasswordReset, resetPassword, changePassword, logout, activateAuthenticatedAccount }}>{children}</AccountContext.Provider>;
}

export function useMockAccount() {
  const value = useContext(AccountContext);
  if (!value) throw new Error('AccountProvider is missing');
  return value;
}
