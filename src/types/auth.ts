// Local UI form shapes. They do not represent backend DTOs.
export interface LoginForm {
  identifier: string;
  password: string;
}

export interface AuthenticatedUser {
  userId: number;
  username: string;
  email: string;
  fullName: string;
  role: string;
  status: string;
}

export type DevPreviewAccountId = 'student' | 'newstudent' | 'rejectedstudent';

export interface RegisterForm {
  fullName: string;
  email: string;
  phone: string;
  identityNumber: string;
  identityFrontUri: string | null;
  identityBackUri: string | null;
  username: string;
  password: string;
  confirmPassword: string;
  acceptedTerms: boolean;
}

export type MockLoginResult =
  | { kind: 'success'; accountId: DevPreviewAccountId; residenceStatus: 'active' | 'none' | 'rejected' }
  | { kind: 'pending' }
  | { kind: 'invalid' };

export type AuthenticationResult = { kind: 'api'; user: AuthenticatedUser } | MockLoginResult;
