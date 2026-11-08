import { Feather } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DevPreviewMenu } from '../components/dev/DevPreviewMenu';
import { devPreviewEnabled } from '../config/devPreview';
import { useMockAccount } from '../context/MockAccountContext';
import { useAuth } from '../context/AuthContext';
import { useResidence } from '../context/ResidenceContext';
import { colors, typography } from '../theme';
import type { StudentTabsParamList } from '../types/navigation';
import type { DevPreviewAccountId } from '../types/auth';
import { ResidenceStack } from './ResidenceStack';
import { InvoiceStack } from './InvoiceStack';
import { NotificationStack } from './NotificationStack';
import { ProfileStack } from './ProfileStack';
import { HomeStack } from './HomeStack';

const Tabs = createBottomTabNavigator<StudentTabsParamList>();
export function StudentTabs() {
  const insets = useSafeAreaInsets();
  const auth = useAuth();
  const { session } = useResidence();
  const { accountId, activateDevAccount } = useMockAccount();
  const noRoom = session.status === 'none';
  const rejected = session.status === 'rejected';
  const switchAccount = (id: DevPreviewAccountId) => {
    if (devPreviewEnabled && auth.status !== 'authenticated') activateDevAccount(id);
  };
  return <View style={{ flex: 1 }}><Tabs.Navigator initialRouteName={noRoom || rejected ? 'Room' : 'Home'} screenOptions={({ route }) => ({ headerShown: false, tabBarActiveTintColor: colors.primary, tabBarInactiveTintColor: colors.inactiveTab, tabBarStyle: { height: 60 + insets.bottom, paddingTop: 5, paddingBottom: 5 + insets.bottom, display: (route.name === 'Room' && (['StudentRoomDetail', 'RegisterRoom'].includes(getFocusedRouteNameFromRoute(route) ?? '') || rejected)) || (route.name === 'Invoice' && ['InvoiceDetail', 'PaymentProcessing', 'PaymentSuccess'].includes(getFocusedRouteNameFromRoute(route) ?? '')) || (route.name === 'Home' && getFocusedRouteNameFromRoute(route) === 'CreateRepairRequest') || (route.name === 'Notifications' && getFocusedRouteNameFromRoute(route) === 'NotificationDetail') || (route.name === 'Profile' && ['EditProfile', 'ChangePassword'].includes(getFocusedRouteNameFromRoute(route) ?? '')) ? 'none' : 'flex' }, tabBarLabelStyle: { fontFamily: typography.semibold, fontSize: typography.tab } })}>
    {!noRoom && !rejected && <Tabs.Screen name="Home" component={HomeStack} options={{ title: 'Home', tabBarIcon: ({ color, size }) => <Feather name="home" color={color} size={size} /> }} />}
    <Tabs.Screen name="Room" component={ResidenceStack} options={{ title: 'Phòng', tabBarIcon: ({ color, size }) => <Feather name="inbox" color={color} size={size} /> }} />
    {!noRoom && !rejected && <Tabs.Screen name="Invoice" component={InvoiceStack} options={{ title: 'Hóa đơn', tabBarIcon: ({ color, size }) => <Feather name="file-text" color={color} size={size} /> }} />}
    <Tabs.Screen name="Notifications" component={NotificationStack} options={{ title: 'Thông báo', tabBarIcon: ({ color, size }) => <Feather name="bell" color={color} size={size} /> }} />
    <Tabs.Screen name="Profile" component={ProfileStack} options={{ title: 'Cá nhân', tabBarIcon: ({ color, size }) => <Feather name="user" color={color} size={size} /> }} />
  </Tabs.Navigator>{devPreviewEnabled && auth.status !== 'authenticated' ? <DevPreviewMenu accountId={accountId} onSelect={switchAccount} /> : null}</View>;
}
