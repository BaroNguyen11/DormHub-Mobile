import type { DevPreviewAccountId } from '../types/auth';
import type { AccountProfile } from '../types/profile';

// Profile PDF and Edit Profile PDF show different emails. The profile frame supplies
// the initial value shared by both screens so editing starts from the visible profile.
export const initialProfiles: Readonly<Record<DevPreviewAccountId, AccountProfile>> = {
  student: {
    accountId: 'student', fullName: 'Trần Tiến Anh', studentId: '21520123',
    email: 'minhanh.tran@email.com', phone: '0901 234 567', avatarUri: null,
  },
  newstudent: {
    accountId: 'newstudent', fullName: '', studentId: null,
    email: 'newstudent@dormhub.test', phone: '', avatarUri: null,
  },
  rejectedstudent: {
    accountId: 'rejectedstudent', fullName: '', studentId: null,
    email: 'rejectedstudent@dormhub.test', phone: '', avatarUri: null,
  },
};
