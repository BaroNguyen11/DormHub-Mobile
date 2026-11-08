import { Feather } from '@expo/vector-icons';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Text as TamaText, YStack } from 'tamagui';

import { ProfileAvatar, ProfileMenuRow } from '../components/ui/ProfileUi';
import { SurfaceCard } from '../components/ui/ResidenceUi';
import { ScreenContainer } from '../components/ui/ScreenContainer';
import { useMockAccount } from '../context/MockAccountContext';
import { useResidence } from '../context/ResidenceContext';
import { residentRoom } from '../mocks/residence';
import { colors, typography } from '../theme';
import type { ProfileStackParamList, RootStackParamList, StudentTabsParamList } from '../types/navigation';

type Props = NativeStackScreenProps<ProfileStackParamList, 'ProfileMain'>;

export function ProfileScreen({ navigation }: Props) {
  const { profile, logout } = useMockAccount();
  const { session } = useResidence();
  const tabs = navigation.getParent<BottomTabNavigationProp<StudentTabsParamList>>();
  const hasRoom = session.status === 'active' && !!session.roomId;
  const unavailable = () => Alert.alert('Chưa hỗ trợ', 'Mục này chưa có trong bản xem thử.');
  const signOut = () => {
    logout();
    tabs?.getParent<NativeStackNavigationProp<RootStackParamList>>()?.reset({ index: 0, routes: [{ name: 'Guest', params: { screen: 'Welcome' } }] });
  };

  if (!profile) return <ScreenContainer><Text style={styles.missing}>Không có thông tin tài khoản.</Text></ScreenContainer>;

  return <ScreenContainer>
    <StatusBar style="dark" />
    <YStack style={styles.header}><TamaText style={styles.headerTitle}>Cá nhân</TamaText></YStack>
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Pressable accessibilityRole="button" onPress={() => navigation.navigate('EditProfile')} style={styles.identity}>
        <ProfileAvatar profile={profile} size={60} />
        <YStack style={styles.identityCopy}>
          <Text style={styles.name}>{profile.fullName || 'Chưa cập nhật tên'}</Text>
          <Text style={styles.studentMeta}>MSSV: {profile.studentId ?? 'Chưa cập nhật'} · SV Approved</Text>
        </YStack>
        <Feather name="chevron-right" size={20} color={colors.inactiveTab} />
      </Pressable>

      <TamaText style={styles.sectionTitle}>Thông tin cá nhân</TamaText>
      <SurfaceCard style={styles.card}>
        <ProfileMenuRow icon="mail" title="Email" subtitle={profile.email} />
        <ProfileMenuRow icon="phone" title="Số điện thoại" subtitle={profile.phone || 'Chưa cập nhật'} />
        <Pressable accessibilityRole="button" onPress={() => navigation.navigate('EditProfile')} style={styles.editRow}>
          <Text style={styles.editText}>Chỉnh sửa thông tin</Text>
          <Feather name="chevron-right" size={20} color={colors.inactiveTab} />
        </Pressable>
      </SurfaceCard>

      <TamaText style={styles.sectionTitle}>Tài khoản</TamaText>
      <SurfaceCard style={styles.card}>
        <ProfileMenuRow icon="lock" title="Đổi mật khẩu" onPress={() => navigation.navigate('ChangePassword')} />
        <ProfileMenuRow icon="bell" title="Cài đặt thông báo" onPress={unavailable} />
        <ProfileMenuRow icon="shield" title="Bảo mật" onPress={unavailable} last />
      </SurfaceCard>

      <TamaText style={styles.sectionTitle}>Ký túc xá</TamaText>
      <SurfaceCard style={styles.card}>
        <ProfileMenuRow icon="inbox" title="Phòng hiện tại" subtitle={hasRoom ? `${session.roomId} · ${residentRoom.building}` : 'Chưa có phòng hiện tại'} onPress={() => tabs?.navigate('Room', { screen: hasRoom ? 'MyRoom' : 'Residence' })} />
        <ProfileMenuRow icon="file-text" title="Hợp đồng" subtitle={hasRoom ? undefined : 'Chưa có hợp đồng'} onPress={hasRoom ? () => tabs?.navigate('Room', { screen: 'Contract' }) : undefined} last />
      </SurfaceCard>

      <Pressable accessibilityRole="button" onPress={signOut} style={styles.logout}>
        <Feather name="log-out" size={18} color={colors.error} />
        <Text style={styles.logoutText}>Đăng xuất</Text>
      </Pressable>
    </ScrollView>
  </ScreenContainer>;
}

const styles = StyleSheet.create({
  header: { height: 52, backgroundColor: colors.surface, borderBottomWidth: 0.8, borderBottomColor: colors.border, justifyContent: 'center', paddingHorizontal: 14 },
  headerTitle: { color: colors.text, fontFamily: typography.regular, fontSize: 18 },
  content: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 18 },
  identity: { minHeight: 70, flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 18 },
  identityCopy: { flex: 1 },
  name: { color: colors.text, fontFamily: typography.regular, fontSize: 16 },
  studentMeta: { color: colors.textSecondary, fontFamily: typography.regular, fontSize: 12.5, marginTop: 3 },
  sectionTitle: { color: colors.text, fontFamily: typography.bold, fontSize: 14, marginBottom: 7, marginLeft: 3, marginTop: 14 },
  card: { padding: 0, overflow: 'hidden' },
  editRow: { minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18 },
  editText: { color: colors.primary, fontFamily: typography.bold, fontSize: 14 },
  logout: { height: 48, marginTop: 20, borderWidth: 0.8, borderColor: colors.error, borderRadius: 8, backgroundColor: colors.surface, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  logoutText: { color: colors.error, fontFamily: typography.bold, fontSize: 14.5 },
  missing: { color: colors.textSecondary, fontFamily: typography.regular, padding: 16 },
});
