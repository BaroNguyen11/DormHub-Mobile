import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { SuccessState } from '../components/ui/SuccessState';
import type { GuestStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<GuestStackParamList, 'PasswordChangeSuccess'>;

export function PasswordChangeSuccessScreen({ navigation }: Props) {
  return <SuccessState
    icon="check"
    title="Đặt lại mật khẩu thành công"
    message="Bạn có thể đăng nhập bằng mật khẩu mới ngay bây giờ."
    buttonTitle="Đăng nhập"
    onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Login' }] })}
  />;
}
