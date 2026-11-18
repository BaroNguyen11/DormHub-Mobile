// Local UI form shapes. They do not represent backend DTOs.
export interface LoginForm {
  identifier: string;
  password: string;
}

export interface RegisterForm {
  fullName: string;
  email: string;
  phone: string;
  studentCode: string;
  username: string;
  password: string;
  confirmPassword: string;
  acceptedTerms: boolean;
}
