import type { LoginForm, RegisterForm } from '../types/auth';
import type { ChangePasswordForm, ProfileEditForm } from '../types/profile';
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
  if (!/^\d{12}$/.test(form.identityNumber.trim())) errors.identityNumber = 'CCCD phải gồm 12 chữ số';
  if (!form.identityFrontUri) errors.identityFrontUri = 'Vui lòng chọn ảnh mặt trước CCCD';
  if (!form.identityBackUri) errors.identityBackUri = 'Vui lòng chọn ảnh mặt sau CCCD';
  if (!form.username.trim()) errors.username = 'Vui lòng nhập username';
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

export function validateProfileEdit(form: ProfileEditForm): FieldErrors<'fullName' | 'email' | 'phone'> {
  const errors: FieldErrors<'fullName' | 'email' | 'phone'> = {};
  if (!form.fullName.trim()) errors.fullName = 'Vui lòng nhập họ và tên';
  if (!emailPattern.test(form.email.trim())) errors.email = 'Email không hợp lệ';
  if (!phonePattern.test(form.phone.replace(/[\s.-]/g, ''))) errors.phone = 'Số điện thoại không hợp lệ';
  return errors;
}

export function validateChangePassword(form: ChangePasswordForm): FieldErrors<keyof ChangePasswordForm> {
  const errors: FieldErrors<keyof ChangePasswordForm> = {};
  if (!form.currentPassword) errors.currentPassword = 'Vui lòng nhập mật khẩu hiện tại';
  if (form.newPassword.length < 8) errors.newPassword = 'Mật khẩu mới cần ít nhất 8 ký tự';
  if (form.newPassword === form.currentPassword && form.newPassword) errors.newPassword = 'Mật khẩu mới phải khác mật khẩu hiện tại';
  if (form.confirmPassword !== form.newPassword) errors.confirmPassword = 'Mật khẩu xác nhận không khớp';
  return errors;
}
