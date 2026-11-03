import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ContractScreen } from '../screens/ContractScreen';
import { FindRoomScreen } from '../screens/FindRoomScreen';
import { MyRoomScreen } from '../screens/MyRoomScreen';
import { RegisterRoomScreen } from '../screens/RegisterRoomScreen';
import { RequestStatusScreen } from '../screens/RequestStatusScreen';
import { ResidenceLandingScreen } from '../screens/ResidenceLandingScreen';
import { StudentRoomDetailScreen } from '../screens/StudentRoomDetailScreen';
import { UtilitiesScreen } from '../screens/UtilitiesScreen';
import type { ResidenceStackParamList } from '../types/navigation';

const Stack = createNativeStackNavigator<ResidenceStackParamList>();
export function ResidenceStack() { return <Stack.Navigator initialRouteName="Residence" screenOptions={{ headerShown: false }}><Stack.Screen name="Residence" component={ResidenceLandingScreen} /><Stack.Screen name="FindRoom" component={FindRoomScreen} /><Stack.Screen name="StudentRoomDetail" component={StudentRoomDetailScreen} /><Stack.Screen name="RegisterRoom" component={RegisterRoomScreen} /><Stack.Screen name="RequestStatus" component={RequestStatusScreen} /><Stack.Screen name="MyRoom" component={MyRoomScreen} /><Stack.Screen name="Contract" component={ContractScreen} /><Stack.Screen name="Utilities" component={UtilitiesScreen} /></Stack.Navigator>; }
