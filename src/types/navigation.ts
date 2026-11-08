import type { NavigatorScreenParams } from '@react-navigation/native';
import type { RoomSearchFilters } from './room';
import type { PaymentMethod } from './invoice';
import type { ChatConversationId } from './chat';

export type GuestStackParamList = {
  Welcome: undefined;
  Explore: { filters?: RoomSearchFilters } | undefined;
  Filter: { initialFilters: RoomSearchFilters };
  RoomDetail: { roomId: string };
  Login: { status?: 'pending' | 'invalid' } | undefined;
  Register: undefined;
  RegisterSuccess: undefined;
  ForgotPassword: undefined;
  OtpConfirm: { email: string; isMock?: boolean };
  ResetPassword: { email: string; otp: string; isMock?: boolean };
  ResetSuccess: undefined;
  PasswordChangeSuccess: undefined;
  Unavailable: { title: string };
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
  InvoiceDetail: { invoiceId: string };
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
  Chat: NavigatorScreenParams<ChatStackParamList> | undefined;
};

export type ChatStackParamList = {
  ChatList: undefined;
  ChatMessage: { conversationId: ChatConversationId };
};
