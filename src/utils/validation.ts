import type { LoginForm, RegisterForm } from '../types/auth';
import type { ChangePasswordForm } from '../types/profile';
import type { FieldErrors } from '../types/validation';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^(0|\+84)\d{9}$/;

export function validateLogin(form: LoginForm): FieldErrors<keyof LoginForm> {
  const errors: FieldErrors<keyof LoginForm> = {};
  if (!form.identifier.trim()) errors.identifier = 'Vui lòng nhập username hoặc email';
  if (!form.password) errors.password = 'Vui lòng nhập mật khẩu';
  return errors;
}

export function validateRegister(form: RegisterForm): FieldErrors<keyof RegisterForm> {
  const errors: FieldErrors<keyof RegisterForm> = {};
  if (!form.fullName.trim()) errors.fullName = 'Vui lòng nhập họ và tên';
  if (!emailPattern.test(form.email.trim())) errors.email = 'Email không hợp lệ';
  if (!phonePattern.test(form.phone.replace(/[\s.-]/g, ''))) errors.phone = 'Số điện thoại không hợp lệ';
  if (!/^\d{8}$/.test(form.studentCode.trim())) errors.studentCode = 'Mã sinh viên phải gồm đúng 8 chữ số';
  if (form.username.trim().length < 3 || form.username.trim().length > 30) errors.username = 'Username phải từ 3 đến 30 ký tự';
  if (form.password.length < 8) errors.password = 'Mật khẩu cần ít nhất 8 ký tự';
  if (form.confirmPassword !== form.password) errors.confirmPassword = 'Mật khẩu xác nhận không khớp';
  if (!form.acceptedTerms) errors.acceptedTerms = 'Vui lòng đồng ý với điều khoản';
  return errors;
}

export function validateEmail(email: string): string | undefined {
  return emailPattern.test(email.trim()) ? undefined : 'Email không hợp lệ';
}

export function validateOtp(value: string): string | undefined {
  return /^\d{6}$/.test(value) ? undefined : 'Mã OTP phải gồm 6 chữ số';
}

export function validateNewPassword(password: string, confirmation: string): FieldErrors<'password' | 'confirmation'> {
  const errors: FieldErrors<'password' | 'confirmation'> = {};
  if (password.length < 8) errors.password = 'Mật khẩu cần ít nhất 8 ký tự';
  if (confirmation !== password) errors.confirmation = 'Mật khẩu xác nhận không khớp';
  return errors;
}

export function validateStudentPhone(phone: string): string | undefined {
  if (!phone) return 'Vui lòng nhập số điện thoại. Không thể xóa số điện thoại ở phiên bản này.';
  return /^(0|\+84)[35789][0-9]{8}$/.test(phone) ? undefined : 'Số điện thoại không hợp lệ';
}

export function validateChangePassword(form: ChangePasswordForm): FieldErrors<keyof ChangePasswordForm> {
  const errors: FieldErrors<keyof ChangePasswordForm> = {};
  if (!form.currentPassword) errors.currentPassword = 'Vui lòng nhập mật khẩu hiện tại';
  if (form.newPassword.length < 8) errors.newPassword = 'Mật khẩu mới cần ít nhất 8 ký tự';
  else if (form.newPassword.length > 50) errors.newPassword = 'Mật khẩu mới không được vượt quá 50 ký tự';
  if (form.newPassword === form.currentPassword && form.newPassword) errors.newPassword = 'Mật khẩu mới phải khác mật khẩu hiện tại';
  if (form.confirmPassword !== form.newPassword) errors.confirmPassword = 'Mật khẩu xác nhận không khớp';
  return errors;
}
