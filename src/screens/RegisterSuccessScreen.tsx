import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SuccessState } from '../components/ui/SuccessState';
import type { GuestStackParamList } from '../types/navigation';
type Props = NativeStackScreenProps<GuestStackParamList, 'RegisterSuccess'>;
export function RegisterSuccessScreen({ navigation }: Props) { return <SuccessState icon="clock" title="Đăng ký thành công" message="Tài khoản của bạn đang chờ Manager duyệt. Chúng tôi sẽ thông báo khi tài khoản được kích hoạt." badge="Chờ duyệt" buttonTitle="Về trang chủ" onPress={() => navigation.popTo('Welcome')} />; }
