import type { DevPreviewAccountId, LoginForm, MockLoginResult } from '../types/auth';
import type { ResidenceStatus } from '../types/residence';

// Demo behavior only; no backend request or assumed API response shape.
const demoAccounts = [
  { username: 'student', email: 'student@dormhub.test', password: 'DormHub123', approval: 'approved', residenceStatus: 'active' },
  { username: 'newstudent', email: 'newstudent@dormhub.test', password: 'DormHub123', approval: 'approved', residenceStatus: 'none' },
  { username: 'rejectedstudent', email: 'rejectedstudent@dormhub.test', password: 'DormHub123', approval: 'approved', residenceStatus: 'rejected' },
  { username: '23647241', email: 'nguyenvana@dormhub.test', password: '12345678', approval: 'pending' },
] as const;

export const devPreviewAccounts: readonly { id: DevPreviewAccountId; residenceStatus: ResidenceStatus; label: string }[] = [
  { id: 'student', residenceStatus: 'active', label: 'student · Đang ở' },
  { id: 'newstudent', residenceStatus: 'none', label: 'newstudent · Chưa có phòng' },
  { id: 'rejectedstudent', residenceStatus: 'rejected', label: 'rejectedstudent · Bị từ chối' },
];

export const demoOtp = '482619';

export function simulateLogin(form: LoginForm, passwordOverrides: Partial<Record<DevPreviewAccountId, string>> = {}): MockLoginResult {
  const identifier = form.identifier.trim().toLowerCase();
  const account = demoAccounts.find((item) =>
    item.username === identifier || item.email === identifier,
  );
  if (!account) return { kind: 'invalid' };
  const expectedPassword = account.approval === 'approved' ? (passwordOverrides[account.username] ?? account.password) : account.password;
  if (expectedPassword !== form.password) return { kind: 'invalid' };
  return account.approval === 'pending' ? { kind: 'pending' } : { kind: 'success', accountId: account.username, residenceStatus: account.residenceStatus };
}
