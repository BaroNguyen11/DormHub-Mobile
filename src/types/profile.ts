import type { DevPreviewAccountId } from './auth';

// Local preview data only; not a backend DTO.
export interface AccountProfile {
  accountId: DevPreviewAccountId;
  fullName: string;
  studentId: string | null;
  email: string;
  phone: string;
  avatarUri: string | null;
}

export type ProfileEditForm = Pick<AccountProfile, 'fullName' | 'email' | 'phone' | 'avatarUri'>;

export interface ChangePasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
