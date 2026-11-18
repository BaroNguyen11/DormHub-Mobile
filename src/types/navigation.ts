import type { NavigatorScreenParams } from '@react-navigation/native';
import type { RoomSearchFilters } from './room';
import type { PaymentMethod } from './invoice';

export type GuestStackParamList = {
  Welcome: undefined;
  Explore: { filters?: RoomSearchFilters } | undefined;
  Filter: { initialFilters: RoomSearchFilters };
  RoomDetail: { roomId: string };
  Login: { status?: 'pending' | 'invalid' | 'verified'; message?: string } | undefined;
  ActivateAccount: undefined;
  Register: undefined;
  RegisterSuccess: undefined;
  ForgotPassword: undefined;
  OtpConfirm: { email: string };
  ResetPassword: { email: string; otp: string };
  ResetSuccess: undefined;
  PasswordChangeSuccess: undefined;
};

export type StudentTabsParamList = {
  Home: NavigatorScreenParams<HomeStackParamList> | undefined;
  Room: NavigatorScreenParams<ResidenceStackParamList> | undefined;
  Invoice: NavigatorScreenParams<InvoiceStackParamList> | undefined;
  Notifications: NavigatorScreenParams<NotificationStackParamList> | undefined;
  Profile: NavigatorScreenParams<ProfileStackParamList> | undefined;
};

export type HomeStackParamList = {
  HomeDashboard: undefined;
  RepairRequestList: undefined;
  CreateRepairRequest: undefined;
  RepairRequestDetail: { requestId: string };
  RepairHistory: undefined;
};

export type InvoiceStackParamList = {
  InvoiceList: undefined;
  InvoiceDetail: { invoiceId: string; paymentError?: string };
  PaymentProcessing: { invoiceId: string; method: PaymentMethod };
  PaymentSuccess: { paymentId: string };
  PaymentHistory: undefined;
};

export type NotificationStackParamList = {
  NotificationCenter: undefined;
  NotificationDetail: { notificationId: string };
};

export type ProfileStackParamList = {
  ProfileMain: undefined;
  EditProfile: undefined;
  ChangePassword: undefined;
};

export type ResidenceStackParamList = {
  Residence: undefined;
  FindRoom: undefined;
  StudentRoomDetail: { roomId: string };
  RegisterRoom: { roomId: string };
  RequestStatus: undefined;
  MyRoom: undefined;
  Contract: undefined;
  Utilities: undefined;
};

export type RootStackParamList = {
  Splash: undefined;
  Guest: NavigatorScreenParams<GuestStackParamList> | undefined;
  Student: NavigatorScreenParams<StudentTabsParamList> | undefined;
};
