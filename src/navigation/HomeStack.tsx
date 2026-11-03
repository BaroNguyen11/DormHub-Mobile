import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CreateRepairRequestScreen } from '../screens/CreateRepairRequestScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { RepairHistoryScreen } from '../screens/RepairHistoryScreen';
import { RepairRequestDetailScreen } from '../screens/RepairRequestDetailScreen';
import { RepairRequestListScreen } from '../screens/RepairRequestListScreen';
import type { HomeStackParamList } from '../types/navigation';

const Stack = createNativeStackNavigator<HomeStackParamList>();
export function HomeStack() { return <Stack.Navigator initialRouteName="HomeDashboard" screenOptions={{ headerShown: false }}><Stack.Screen name="HomeDashboard" component={HomeScreen} /><Stack.Screen name="RepairRequestList" component={RepairRequestListScreen} /><Stack.Screen name="CreateRepairRequest" component={CreateRepairRequestScreen} /><Stack.Screen name="RepairRequestDetail" component={RepairRequestDetailScreen} /><Stack.Screen name="RepairHistory" component={RepairHistoryScreen} /></Stack.Navigator>; }
