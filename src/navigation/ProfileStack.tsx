import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { CCCDCameraScreen } from '../screens/CCCDCameraScreen';
import { CCCDInputScreen } from '../screens/CCCDInputScreen';
import { ChangePasswordScreen } from '../screens/ChangePasswordScreen';
import { DocumentPickerScreen } from '../screens/DocumentPickerScreen';
import { EditProfileScreen } from '../screens/EditProfileScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import type { ProfileStackParamList } from '../types/navigation';

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export function ProfileStack() {
  return <Stack.Navigator initialRouteName="ProfileMain" screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ProfileMain" component={ProfileScreen} />
    <Stack.Screen name="EditProfile" component={EditProfileScreen} />
    <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
    <Stack.Screen name="CCCDInput" component={CCCDInputScreen} />
    <Stack.Screen name="CCCDCamera" component={CCCDCameraScreen} />
    <Stack.Screen name="DocumentPicker" component={DocumentPickerScreen} />
  </Stack.Navigator>;
}
