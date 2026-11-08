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
