export type StudentGender = 'MALE' | 'FEMALE' | 'OTHER';

export interface StudentProfile {
  studentId: number;
  studentCode: string | null;
  dateOfBirth: string | null;
  gender: StudentGender | null;
  address: string | null;
  avatarUrl: string | null;
  phone: string | null;
  cic: string | null;
  username: string | null;
  email: string | null;
  fullName: string | null;
}

export interface StudentProfileUpdate {
  phone: string;
}
