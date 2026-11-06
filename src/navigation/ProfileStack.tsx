import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { ChangePasswordScreen } from '../screens/ChangePasswordScreen';
import { EditProfileScreen } from '../screens/EditProfileScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import type { ProfileStackParamList } from '../types/navigation';

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export function ProfileStack() {
  return <Stack.Navigator initialRouteName="ProfileMain" screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ProfileMain" component={ProfileScreen} />
    <Stack.Screen name="EditProfile" component={EditProfileScreen} />
    <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
  </Stack.Navigator>;
}
