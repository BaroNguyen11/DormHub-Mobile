import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SuccessState } from '../components/ui/SuccessState';
import type { GuestStackParamList } from '../types/navigation';
type Props = NativeStackScreenProps<GuestStackParamList, 'RegisterSuccess'>;
export function RegisterSuccessScreen({ navigation }: Props) {
  return <SuccessState icon="clock" title="Tạo tài khoản thành công" message="Tiếp theo, nhập email để yêu cầu mã OTP. Sau khi xác thực email, bạn có thể đăng nhập." badge="Cần kích hoạt email" buttonTitle="Kích hoạt tài khoản" onPress={() => navigation.replace('ActivateAccount')} />;
}
