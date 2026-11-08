import { createContext, useCallback, useContext, useRef, useState } from 'react';
import type { PropsWithChildren } from 'react';
import { devPreviewEnabled } from '../config/devPreview';
import { devPreviewAccounts } from '../mocks/auth';
import { simulateLogin } from '../mocks/auth';
import { initialProfiles } from '../mocks/profiles';
import type { DevPreviewAccountId, LoginForm, MockLoginResult } from '../types/auth';
import type { AccountProfile, ProfileEditForm } from '../types/profile';
import type { ResidenceStatus } from '../types/residence';
import { useInvoices } from './InvoiceContext';
import { useNotifications } from './NotificationContext';
import { useRepairs } from './RepairContext';
import { useResidence } from './ResidenceContext';

interface MockAccountContextValue {
  accountId: DevPreviewAccountId | null;
  postLogoutDestination: 'Welcome' | 'PasswordChangeSuccess';
  profile: AccountProfile | null;
  authenticate: (form: LoginForm) => MockLoginResult;
  updateProfile: (form: ProfileEditForm, expectedAccountId: DevPreviewAccountId) => boolean;
  changePassword: (currentPassword: string, newPassword: string) => 'success' | 'incorrect' | 'invalid' | 'unavailable';
  logout: (destination?: 'Welcome' | 'PasswordChangeSuccess') => void;
  activateAuthenticatedAccount: (result: Extract<MockLoginResult, { kind: 'success' }>) => void;
  activateDevAccount: (accountId: DevPreviewAccountId) => boolean;
}
const MockAccountContext = createContext<MockAccountContextValue | null>(null);

export function MockAccountProvider({ children }: PropsWithChildren) {
  const { setStatus } = useResidence();
  const { resetForAccount: resetInvoices } = useInvoices();
  const { resetForAccount: resetRepairs } = useRepairs();
  const { resetForAccount: resetNotifications } = useNotifications();
  const [accountId, setAccountId] = useState<DevPreviewAccountId | null>(null);
  const [postLogoutDestination, setPostLogoutDestination] = useState<'Welcome' | 'PasswordChangeSuccess'>('Welcome');
  const accountIdRef = useRef<DevPreviewAccountId | null>(null);
  const [profiles, setProfiles] = useState<Record<DevPreviewAccountId, AccountProfile>>(() => ({
    student: { ...initialProfiles.student },
    newstudent: { ...initialProfiles.newstudent },
    rejectedstudent: { ...initialProfiles.rejectedstudent },
  }));
  // Demo credentials live only in React memory. They are not persisted or logged.
  const [passwordOverrides, setPasswordOverrides] = useState<Partial<Record<DevPreviewAccountId, string>>>({});
  const activate = useCallback((id: DevPreviewAccountId, status: ResidenceStatus) => {
    setPostLogoutDestination('Welcome');
    resetInvoices(status);
    resetRepairs(status);
    resetNotifications(id);
    setStatus(status);
    accountIdRef.current = id;
    setAccountId(id);
  }, [resetInvoices, resetRepairs, resetNotifications, setStatus]);
  const activateAuthenticatedAccount = useCallback((result: Extract<MockLoginResult, { kind: 'success' }>) => {
    activate(result.accountId, result.residenceStatus);
  }, [activate]);
  const authenticate = useCallback((form: LoginForm) => simulateLogin(form, passwordOverrides), [passwordOverrides]);
  const updateProfile = useCallback((form: ProfileEditForm, expectedAccountId: DevPreviewAccountId): boolean => {
    if (!accountId || accountIdRef.current !== expectedAccountId || accountId !== expectedAccountId) return false;
    setProfiles((previous) => ({ ...previous, [accountId]: { ...previous[accountId], ...form } }));
    return true;
  }, [accountId]);
  const changePassword = useCallback((currentPassword: string, newPassword: string) => {
    if (!accountId) return 'unavailable';
    if (newPassword.length < 8 || newPassword === currentPassword) return 'invalid';
    const result = simulateLogin({ identifier: accountId, password: currentPassword }, passwordOverrides);
    if (result.kind !== 'success' || result.accountId !== accountId) return 'incorrect';
    setPasswordOverrides((previous) => ({ ...previous, [accountId]: newPassword }));
    return 'success';
  }, [accountId, passwordOverrides]);
  const logout = useCallback((destination: 'Welcome' | 'PasswordChangeSuccess' = 'Welcome') => {
    setPostLogoutDestination(destination);
    resetInvoices('none');
    resetRepairs('none');
    resetNotifications(null);
    setStatus('none');
    accountIdRef.current = null;
    setAccountId(null);
  }, [resetInvoices, resetRepairs, resetNotifications, setStatus]);
  const activateDevAccount = useCallback((id: DevPreviewAccountId): boolean => {
    if (!devPreviewEnabled) return false;
    const account = devPreviewAccounts.find((item) => item.id === id);
    if (!account) return false;
    activate(account.id, account.residenceStatus);
    return true;
  }, [activate]);
  const profile = accountId ? profiles[accountId] : null;
  return <MockAccountContext.Provider value={{ accountId, postLogoutDestination, profile, authenticate, updateProfile, changePassword, logout, activateAuthenticatedAccount, activateDevAccount }}>{children}</MockAccountContext.Provider>;
}

export function useMockAccount() { const value = useContext(MockAccountContext); if (!value) throw new Error('MockAccountProvider is missing'); return value; }
