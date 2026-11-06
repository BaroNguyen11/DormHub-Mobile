import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SuccessState } from '../components/ui/SuccessState';
import type { GuestStackParamList } from '../types/navigation';
type Props = NativeStackScreenProps<GuestStackParamList, 'ResetSuccess'>;
export function ResetSuccessScreen({ navigation }: Props) { return <SuccessState icon="check" title="Đặt lại mật khẩu thành công" message="Mật khẩu của bạn đã được cập nhật. Hãy đăng nhập bằng mật khẩu mới." buttonTitle="Đăng nhập" onPress={() => navigation.popTo('Login')} />; }
