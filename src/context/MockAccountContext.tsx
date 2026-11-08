import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { PropsWithChildren } from 'react';
import { changeStudentPassword, getCurrentUser, isUnauthorizedAuthError, loginWithEmail, logoutFromBackend, refreshSession, requestPasswordReset as requestPasswordResetApi, resetStudentPassword } from '../api/auth';
import { getStudentProfile, patchStudentProfile } from '../api/profile';
import { getCurrentRoomAssignment, getStudentRoomAssignments } from '../api/roomAssignments';
import { devPreviewEnabled } from '../config/devPreview';
import { devPreviewAccounts, simulateLogin } from '../mocks/auth';
import { mockSession } from '../mocks/session';
import { initialProfiles } from '../mocks/profiles';
import type { AuthenticatedUser, AuthenticationResult, DevPreviewAccountId, LoginForm } from '../types/auth';
import type { AccountProfile, ProfileEditForm, StudentProfileDto, StudentProfileUpdate } from '../types/profile';
import type { ResidenceStatus } from '../types/residence';
import { useInvoices } from './InvoiceContext';
import { useNotifications } from './NotificationContext';
import { useRepairs } from './RepairContext';
import { useResidence } from './ResidenceContext';

interface MockAccountContextValue {
  accountId: DevPreviewAccountId | null;
  isAuthenticated: boolean;
  isSessionInitializing: boolean;
  profile: AccountProfile | null;
  authenticate: (form: LoginForm) => Promise<AuthenticationResult>;
  updateProfile: (form: ProfileEditForm) => void;
  refreshProfile: () => Promise<void>;
  saveStudentProfile: (update: StudentProfileUpdate) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<boolean>;
  resetPassword: (email: string, otp: string, newPassword: string, isMock: boolean) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<'success' | 'incorrect' | 'invalid' | 'unavailable'>;
  logout: () => Promise<boolean>;
  activateAuthenticatedAccount: (user: AuthenticatedUser) => Promise<void>;
  activateDevAccount: (accountId: DevPreviewAccountId) => boolean;
}
const MockAccountContext = createContext<MockAccountContextValue | null>(null);

function toAccountProfile(profile: StudentProfileDto): AccountProfile {
  return {
    accountId: String(profile.studentId),
    fullName: profile.fullName,
    studentId: profile.studentCode,
    email: profile.email,
    phone: profile.phone ?? '',
    avatarUri: profile.avatarUrl,
  };
}

export function MockAccountProvider({ children }: PropsWithChildren) {
  const { setStatus, setBackendRoom, refreshBackendApplications, clearBackendApplications } = useResidence();
  const { resetForAccount: resetInvoices } = useInvoices();
  const { resetForAccount: resetRepairs } = useRepairs();
  const { resetForAccount: resetNotifications } = useNotifications();
  const [accountId, setAccountId] = useState<DevPreviewAccountId | null>(null);
  const [authenticatedUser, setAuthenticatedUser] = useState<AuthenticatedUser | null>(null);
  const [authenticatedProfile, setAuthenticatedProfile] = useState<AccountProfile | null>(null);
  const [isSessionInitializing, setIsSessionInitializing] = useState(true);
  const sessionRestoreRef = useRef<Promise<AuthenticatedUser | null> | null>(null);
  const [profiles, setProfiles] = useState<Record<DevPreviewAccountId, AccountProfile>>(() => ({
    student: { ...initialProfiles.student },
    newstudent: { ...initialProfiles.newstudent },
    rejectedstudent: { ...initialProfiles.rejectedstudent },
  }));
  // Demo credentials live only in React memory. They are not persisted or logged.
  const [passwordOverrides, setPasswordOverrides] = useState<Partial<Record<DevPreviewAccountId, string>>>({});
  const activate = useCallback((id: DevPreviewAccountId, status: ResidenceStatus) => {
    clearBackendApplications();
    setAuthenticatedUser(null);
    setAuthenticatedProfile(null);
    resetInvoices(status);
    resetRepairs(status);
    resetNotifications(id);
    setStatus(status);
    setAccountId(id);
  }, [clearBackendApplications, resetInvoices, resetRepairs, resetNotifications, setStatus]);
  const activateAuthenticatedAccount = useCallback(async (user: AuthenticatedUser) => {
    clearBackendApplications();
    resetInvoices('none');
    resetRepairs('none');
    resetNotifications(null, true);
    setStatus('none');
    setBackendRoom(null);
    setAccountId(null);
    setAuthenticatedUser(user);
    setAuthenticatedProfile({ accountId: String(user.userId), fullName: user.fullName, studentId: null, email: user.email, phone: '', avatarUri: null });
    try {
      const assignments = await getStudentRoomAssignments(0, 20);
      const currentAssignment = getCurrentRoomAssignment(assignments);
      if (currentAssignment) {
        setBackendRoom(currentAssignment);
        resetRepairs('active', true);
      } else {
        await refreshBackendApplications();
      }
    } catch {
      // Keep login available if this account has no accessible room assignment endpoint yet.
    }
  }, [clearBackendApplications, resetInvoices, resetRepairs, resetNotifications, refreshBackendApplications, setBackendRoom, setStatus]);
  useEffect(() => {
    let active = true;
    if (devPreviewEnabled && mockSession.kind === 'student') {
      setIsSessionInitializing(false);
      return () => { active = false; };
    }
    if (!sessionRestoreRef.current) {
      sessionRestoreRef.current = (async () => {
        try {
          return await getCurrentUser();
        } catch (error) {
          if (!isUnauthorizedAuthError(error)) return null;
          try { return await refreshSession(); }
          catch { return null; }
        }
      })();
    }
    void sessionRestoreRef.current.then(async (user) => {
      if (active && user) await activateAuthenticatedAccount(user);
    }).finally(() => {
      if (active) setIsSessionInitializing(false);
    });
    return () => { active = false; };
  }, [activateAuthenticatedAccount]);
  const authenticate = useCallback(async (form: LoginForm): Promise<AuthenticationResult> => {
    if (devPreviewEnabled && form.identifier.trim().toLowerCase().endsWith('@dormhub.test')) {
      return simulateLogin(form, passwordOverrides);
    }
    return { kind: 'api', user: await loginWithEmail(form.identifier, form.password) };
  }, [passwordOverrides]);
  const requestPasswordReset = useCallback(async (email: string): Promise<boolean> => {
    const isMock = devPreviewEnabled && email.trim().toLowerCase().endsWith('@dormhub.test');
    if (isMock) return true;
    await requestPasswordResetApi(email);
    return false;
  }, []);
  const resetPassword = useCallback(async (email: string, otp: string, newPassword: string, isMock: boolean): Promise<void> => {
    if (!isMock) {
      await resetStudentPassword({ email: email.trim(), otp, newPassword });
      return;
    }
    const localPart = email.trim().toLowerCase().split('@')[0];
    const mockAccount = devPreviewAccounts.find((item) => item.id === localPart);
    if (mockAccount) setPasswordOverrides((previous) => ({ ...previous, [mockAccount.id]: newPassword }));
  }, []);
  const updateProfile = useCallback((form: ProfileEditForm) => {
    if (accountId) setProfiles((previous) => ({ ...previous, [accountId]: { ...previous[accountId], ...form } }));
    else if (authenticatedProfile) setAuthenticatedProfile((previous) => previous ? { ...previous, ...form } : previous);
  }, [accountId, authenticatedProfile]);
  const refreshProfile = useCallback(async () => {
    if (!authenticatedUser) return;
    const studentProfile = await getStudentProfile();
    setAuthenticatedProfile(toAccountProfile(studentProfile));
  }, [authenticatedUser]);
  const saveStudentProfile = useCallback(async (update: StudentProfileUpdate) => {
    if (!authenticatedUser) throw new Error('No backend student session is active.');
    const studentProfile = await patchStudentProfile(update);
    setAuthenticatedProfile(toAccountProfile(studentProfile));
  }, [authenticatedUser]);
  const changePassword = useCallback(async (currentPassword: string, newPassword: string): Promise<'success' | 'incorrect' | 'invalid' | 'unavailable'> => {
    if (authenticatedUser) {
      await changeStudentPassword({ oldPassword: currentPassword, newPassword, confirmPassword: newPassword });
      return 'success';
    }
    if (!accountId) return 'unavailable';
    if (newPassword.length < 6 || newPassword.length > 50 || newPassword === currentPassword) return 'invalid';
    const result = simulateLogin({ identifier: accountId, password: currentPassword }, passwordOverrides);
    if (result.kind !== 'success' || result.accountId !== accountId) return 'incorrect';
    setPasswordOverrides((previous) => ({ ...previous, [accountId]: newPassword }));
    return 'success';
  }, [accountId, authenticatedUser, passwordOverrides]);
  const logout = useCallback(async (): Promise<boolean> => {
    let serverLogoutSucceeded = true;
    if (authenticatedUser) {
      try {
        await logoutFromBackend();
      } catch {
        serverLogoutSucceeded = false;
      }
    }
    resetInvoices('none');
    clearBackendApplications();
    resetRepairs('none');
    resetNotifications(null);
    setStatus('none');
    setAccountId(null);
    setAuthenticatedUser(null);
    setAuthenticatedProfile(null);
    return serverLogoutSucceeded;
  }, [authenticatedUser, clearBackendApplications, resetInvoices, resetRepairs, resetNotifications, setStatus]);
  const activateDevAccount = useCallback((id: DevPreviewAccountId): boolean => {
    if (!devPreviewEnabled) return false;
    const account = devPreviewAccounts.find((item) => item.id === id);
    if (!account) return false;
    activate(account.id, account.residenceStatus);
    return true;
  }, [activate]);
  const profile = accountId ? profiles[accountId] : authenticatedProfile;
  return <MockAccountContext.Provider value={{ accountId, isAuthenticated: Boolean(accountId || authenticatedUser), isSessionInitializing, profile, authenticate, updateProfile, refreshProfile, saveStudentProfile, requestPasswordReset, resetPassword, changePassword, logout, activateAuthenticatedAccount, activateDevAccount }}>{children}</MockAccountContext.Provider>;
}

export function useMockAccount() { const value = useContext(MockAccountContext); if (!value) throw new Error('MockAccountProvider is missing'); return value; }
