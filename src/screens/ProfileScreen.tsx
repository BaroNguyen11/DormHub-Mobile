import { Feather } from '@expo/vector-icons';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Text as TamaText, YStack } from 'tamagui';

import { ProfileAvatar, ProfileMenuRow, validRemoteAvatarUrl } from '../components/ui/ProfileUi';
import { getStudentProfile } from '../api/studentProfile';
import { SurfaceCard } from '../components/ui/ResidenceUi';
import { ScreenContainer } from '../components/ui/ScreenContainer';
import { useAuth } from '../context/AuthContext';
import { useResidence } from '../context/ResidenceContext';
import { colors, typography } from '../theme';
import type { ProfileStackParamList, StudentTabsParamList } from '../types/navigation';
import type { StudentProfile } from '../types/studentProfile';

type Props = NativeStackScreenProps<ProfileStackParamList, 'ProfileMain'>;

export function ProfileScreen({ navigation }: Props) {
  const auth = useAuth();
  const realUser = auth.status === 'authenticated' ? auth.user : null;
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  useFocusEffect(useCallback(() => {
    if (!realUser) return;
    let active = true;
    setProfileLoading(true);
    setProfileError(null);
    setStudentProfile(null);
    getStudentProfile()
      .then((result) => { if (active) setStudentProfile(result.data ?? null); })
      .catch(() => { if (active) { setStudentProfile(null); setProfileError('Không tải được hồ sơ sinh viên.'); } })
      .finally(() => { if (active) setProfileLoading(false); });
    return () => { active = false; };
  }, [realUser?.userId, reloadKey]));
  const [signingOut, setSigningOut] = useState(false);
  const { session } = useResidence();
  const tabs = navigation.getParent<BottomTabNavigationProp<StudentTabsParamList>>();
  const hasRoom = session.status === 'active' && !!session.roomId;
  const signOut = async () => {
    if (signingOut) return;
    if (!realUser) return;
    setSigningOut(true);
    try { await auth.signOut(); }
    catch { Alert.alert('Không thể đăng xuất', 'Vui lòng kiểm tra kết nối và thử lại.'); }
    finally { setSigningOut(false); }
  };

  if (!realUser) return <ScreenContainer><Text style={styles.missing}>Không có thông tin tài khoản.</Text></ScreenContainer>;

  const displayName = studentProfile?.fullName || realUser.fullName || 'Chưa cập nhật tên';
  const displayEmail = studentProfile?.email || realUser.email;
  const studentCode = studentProfile?.studentCode || 'Chưa cập nhật MSSV';

  return <ScreenContainer>
    <StatusBar style="dark" />
    <YStack style={styles.header}><TamaText style={styles.headerTitle}>Cá nhân</TamaText></YStack>
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {profileLoading ? <Text style={styles.stateText}>Đang tải hồ sơ...</Text> : null}
      {profileError ? <View style={styles.stateRow}><Text style={styles.errorText}>{profileError}</Text><Pressable accessibilityRole="button" onPress={() => setReloadKey((key) => key + 1)}><Text style={styles.retryText}>Thử lại</Text></Pressable></View> : null}
      {!profileLoading && !profileError && !studentProfile ? <Text style={styles.stateText}>Chưa có hồ sơ sinh viên.</Text> : null}
      <Pressable accessibilityRole="button" onPress={() => navigation.navigate('EditProfile')} style={styles.identity}>
        <ProfileAvatar profile={{ fullName: displayName, avatarUri: validRemoteAvatarUrl(studentProfile?.avatarUrl) }} size={60} />
        <YStack style={styles.identityCopy}>
          <Text style={styles.name}>{displayName}</Text>
          <Text style={styles.studentMeta}>MSSV: {studentCode} · Tài khoản đang hoạt động</Text>
        </YStack>
        <Feather name="chevron-right" size={20} color={colors.inactiveTab} />
      </Pressable>

      <TamaText style={styles.sectionTitle}>Thông tin cá nhân</TamaText>
      <SurfaceCard style={styles.card}>
        <ProfileMenuRow icon="mail" title="Email" subtitle={displayEmail} />
        <ProfileMenuRow icon="phone" title="Số điện thoại" subtitle={studentProfile?.phone || (profileError ? 'Chưa tải được' : 'Chưa cập nhật')} />
        <Pressable accessibilityRole="button" onPress={() => navigation.navigate('EditProfile')} style={styles.editRow}>
          <Text style={styles.editText}>Chỉnh sửa thông tin</Text>
          <Feather name="chevron-right" size={20} color={colors.inactiveTab} />
        </Pressable>
      </SurfaceCard>

      <TamaText style={styles.sectionTitle}>Tài khoản</TamaText>
      <SurfaceCard style={styles.card}>
        <ProfileMenuRow icon="lock" title="Đổi mật khẩu" onPress={() => navigation.navigate('ChangePassword')} />
        <ProfileMenuRow icon="shield" title="Bảo mật tài khoản" subtitle="Đổi mật khẩu và bảo vệ tài khoản" last />
      </SurfaceCard>

      <TamaText style={styles.sectionTitle}>Ký túc xá</TamaText>
      <SurfaceCard style={styles.card}>
        <ProfileMenuRow icon="inbox" title="Phòng hiện tại" subtitle={hasRoom ? `${session.room?.roomNumber ?? session.roomId} · ${session.room?.buildingName ?? ''}` : 'Chưa có phòng hiện tại'} onPress={() => tabs?.navigate('Room', { screen: hasRoom ? 'MyRoom' : 'Residence' })} />
        <ProfileMenuRow icon="file-text" title="Hợp đồng" subtitle={hasRoom ? undefined : 'Chưa có hợp đồng'} onPress={hasRoom ? () => tabs?.navigate('Room', { screen: 'Contract' }) : undefined} last />
      </SurfaceCard>

      <Pressable accessibilityRole="button" disabled={signingOut} onPress={() => void signOut()} style={styles.logout}>
        <Feather name="log-out" size={18} color={colors.error} />
        <Text style={styles.logoutText}>{signingOut ? 'Đang đăng xuất...' : 'Đăng xuất'}</Text>
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
  stateText: { color: colors.textSecondary, fontFamily: typography.regular, marginBottom: 12 },
  stateRow: { marginBottom: 12, gap: 8 },
  errorText: { color: colors.error, fontFamily: typography.regular },
  retryText: { color: colors.primary, fontFamily: typography.semibold },
});
