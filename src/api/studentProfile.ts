import { apiRequest } from './httpClient';
import type { StudentProfile, StudentProfileUpdate } from '../types/studentProfile';

export function getStudentProfile() {
  return apiRequest<StudentProfile>('/api/v1/student/profile');
}

export function updateStudentProfile(update: StudentProfileUpdate) {
  return apiRequest<StudentProfile>('/api/v1/student/profile', {
    method: 'PATCH', body: update, csrf: true,
  });
}
