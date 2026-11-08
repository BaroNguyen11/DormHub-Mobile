// UI-facing profile model; it is distinct from the backend profile DTO below.
export interface AccountProfile {
  accountId: string;
  fullName: string;
  studentId: string | null;
  email: string;
  phone: string;
  avatarUri: string | null;
}

export interface StudentProfileDto {
  studentId: number;
  studentCode: string;
  dateOfBirth: string | null;
  gender: string | null;
  address: string | null;
  avatarUrl: string | null;
  phone: string | null;
  cic: string | null;
  username: string;
  email: string;
  fullName: string;
}

export type StudentProfileUpdate = Partial<Pick<StudentProfileDto, 'dateOfBirth' | 'gender' | 'address' | 'avatarUrl' | 'phone'>>;

export type ProfileEditForm = Pick<AccountProfile, 'fullName' | 'email' | 'phone' | 'avatarUri'>;

export interface ChangePasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
