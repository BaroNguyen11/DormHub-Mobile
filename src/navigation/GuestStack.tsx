import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { ExploreScreen } from '../screens/ExploreScreen';
import { FilterScreen } from '../screens/FilterScreen';
import { RoomDetailScreen } from '../screens/RoomDetailScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { ForgotPasswordScreen } from '../screens/ForgotPasswordScreen';
import { OtpConfirmScreen } from '../screens/OtpConfirmScreen';
import { ResetPasswordScreen } from '../screens/ResetPasswordScreen';
import { ResetSuccessScreen } from '../screens/ResetSuccessScreen';
import { PasswordChangeSuccessScreen } from '../screens/PasswordChangeSuccessScreen';
import { PlaceholderScreen } from '../screens/PlaceholderScreen';
import { WelcomeScreen } from '../screens/WelcomeScreen';
import type { GuestStackParamList } from '../types/navigation';

const Stack = createNativeStackNavigator<GuestStackParamList>();

export function GuestStack() {
  return (
    <Stack.Navigator initialRouteName="Welcome" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Explore" component={ExploreScreen} />
      <Stack.Screen name="Filter" component={FilterScreen} options={{ presentation: 'transparentModal', animation: 'fade' }} />
      <Stack.Screen name="RoomDetail" component={RoomDetailScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="OtpConfirm" component={OtpConfirmScreen} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
      <Stack.Screen name="ResetSuccess" component={ResetSuccessScreen} options={{ gestureEnabled: false }} />
      <Stack.Screen name="PasswordChangeSuccess" component={PasswordChangeSuccessScreen} options={{ gestureEnabled: false }} />
      <Stack.Screen name="Unavailable">
        {({ route }) => <PlaceholderScreen title={route.params.title} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
}
