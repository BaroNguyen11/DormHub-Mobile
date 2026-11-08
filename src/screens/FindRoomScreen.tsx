import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import type { StudentRoomDto, StudentRoomFilters, StudentRoomStatus, StudentRoomType } from '../api/studentRooms';
import { getStudentRooms } from '../api/studentRooms';
import { AppButton } from '../components/ui/AppButton';
import { FilterChip } from '../components/ui/FilterChip';
import { ResidenceHeader } from '../components/ui/ResidenceUi';
import { ScreenContainer } from '../components/ui/ScreenContainer';
import { StudentRoomCard, roomTypeLabels } from '../components/ui/StudentRoomCard';
import { useResidence } from '../context/ResidenceContext';
import { colors, radius, typography } from '../theme';
import type { ResidenceStackParamList } from '../types/navigation';

const statusOptions: readonly { value: StudentRoomStatus | undefined; label: string }[] = [
  { value: undefined, label: 'Tất cả' }, { value: 'AVAILABLE', label: 'Đang nhận đăng ký' },
  { value: 'OCCUPIED', label: 'Đã đủ người' }, { value: 'MAINTENANCE', label: 'Bảo trì' },
  { value: 'RESERVED', label: 'Giữ chỗ' },
];
const typeOptions: readonly { value: StudentRoomType | undefined; label: string }[] = [
  { value: undefined, label: 'Mọi loại phòng' },
  ...(['SINGLE', 'DOUBLE', 'QUAD', 'SIX_BED', 'EIGHT_BED'] as const)
    .map((value) => ({ value, label: roomTypeLabels[value] })),
];
const applicationLabels = { PENDING: 'Chờ duyệt', APPROVED: 'Đã duyệt', REJECTED: 'Từ chối', CANCELLED: 'Đã hủy' } as const;

export function FindRoomScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ResidenceStackParamList>>();
  const { backendApplications, refreshBackendApplications } = useResidence();
  const [query, setQuery] = useState('');
  const [searchError, setSearchError] = useState(false);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<StudentRoomStatus>();
  const [roomType, setRoomType] = useState<StudentRoomType>();
  const [rooms, setRooms] = useState<readonly StudentRoomDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(false);
  const [applicationsError, setApplicationsError] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const pageRef = useRef(0);
  const requestVersion = useRef(0);
  const loadingMoreRef = useRef(false);
  const filters = useMemo<StudentRoomFilters>(() => ({
    ...(search ? { search } : {}), ...(status ? { status } : {}), ...(roomType ? { roomType } : {}),
  }), [search, status, roomType]);

  useFocusEffect(useCallback(() => {
    let active = true;
    const version = ++requestVersion.current;
    pageRef.current = 0;
    setRooms([]);
    setLoading(true);
    setError(false);
    setApplicationsError(false);
    setHasMore(false);
    void Promise.allSettled([getStudentRooms(filters), refreshBackendApplications()]).then(([roomResult, applicationResult]) => {
      if (!active || version !== requestVersion.current) return;
      if (roomResult.status === 'fulfilled') {
        setRooms(roomResult.value.content);
        pageRef.current = roomResult.value.page;
        setHasMore(!roomResult.value.last);
      } else setError(true);
      if (applicationResult.status === 'rejected') setApplicationsError(true);
    }).finally(() => { if (active && version === requestVersion.current) setLoading(false); });
    return () => { active = false; requestVersion.current += 1; };
  }, [filters, refreshBackendApplications, reloadKey]));

  const loadMore = async () => {
    if (!hasMore || loadingMoreRef.current || loading) return;
    loadingMoreRef.current = true;
    setLoadingMore(true);
    setError(false);
    const version = requestVersion.current;
    try {
      const result = await getStudentRooms(filters, pageRef.current + 1);
      if (version !== requestVersion.current) return;
      const seen = new Set(rooms.map((item) => item.roomId));
      setRooms((previous) => [...previous, ...result.content.filter((item) => !seen.has(item.roomId))]);
      pageRef.current = result.page;
      setHasMore(!result.last);
    } catch {
      if (version === requestVersion.current) setError(true);
    } finally {
      loadingMoreRef.current = false;
      if (version === requestVersion.current) setLoadingMore(false);
    }
  };

  const submitSearch = () => {
    const next = query.trim();
    if (next.length > 100) { setSearchError(true); return; }
    setSearchError(false);
    if (next === search) setReloadKey((value) => value + 1);
    else setSearch(next);
  };

  return <ScreenContainer><StatusBar style="dark" /><ResidenceHeader title="Tìm phòng" showBack={false} />
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <View style={styles.searchRow}><TextInput value={query} onChangeText={(value) => { setQuery(value); setSearchError(false); }} onSubmitEditing={submitSearch}
        placeholder="Tìm số phòng hoặc tòa nhà" placeholderTextColor={colors.placeholder}
        style={styles.searchInput} returnKeyType="search" accessibilityLabel="Tìm phòng" />
        <Pressable onPress={submitSearch} style={styles.searchButton} accessibilityRole="button"><Text style={styles.searchLabel}>Tìm</Text></Pressable></View>
      {searchError ? <Text style={styles.error}>Từ khóa tìm kiếm tối đa 100 ký tự.</Text> : null}
      <Text style={styles.filterTitle}>Tình trạng</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>{statusOptions.map((option) =>
        <FilterChip key={option.value ?? 'all'} label={option.label} selected={status === option.value} onPress={() => setStatus(option.value)} />)}</ScrollView>
      <Text style={styles.filterTitle}>Loại phòng</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>{typeOptions.map((option) =>
        <FilterChip key={option.value ?? 'all'} label={option.label} selected={roomType === option.value} onPress={() => setRoomType(option.value)} />)}</ScrollView>

      {loading ? <Text style={styles.message}>Đang tải danh sách phòng...</Text> : null}
      {error ? <View style={styles.state}><Text style={styles.message}>Không thể tải phòng. Vui lòng thử lại.</Text><AppButton title="Thử lại" variant="outline" onPress={() => setReloadKey((value) => value + 1)} /></View> : null}
      {!loading && !error && rooms.length === 0 ? <Text style={styles.message}>Không tìm thấy phòng phù hợp.</Text> : null}
      {rooms.map((room) => <StudentRoomCard key={room.roomId} room={room} onPress={() => navigation.navigate('StudentRoomDetail', { roomId: String(room.roomId) })} />)}
      {hasMore ? <AppButton title={loadingMore ? 'Đang tải...' : 'Tải thêm'} variant="outline" disabled={loadingMore} onPress={() => void loadMore()} /> : null}

      {applicationsError ? <Text style={styles.message}>Không thể tải đơn đăng ký của bạn.</Text> : null}
      {!applicationsError && backendApplications.length > 0 ? <View style={styles.applications}>
        <Text style={styles.heading}>Đơn đăng ký của bạn</Text>
        {backendApplications.map((application) => <Pressable key={application.id} onPress={() => navigation.navigate('RequestStatus')} style={styles.application}>
          <Text style={styles.applicationTitle}>Phòng {application.requestedRoomNumber} · {applicationLabels[application.status]}</Text>
          <Text style={styles.message}>{application.requestedBuildingName}</Text>
        </Pressable>)}
      </View> : null}
    </ScrollView>
  </ScreenContainer>;
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 12, paddingBottom: 24 },
  searchRow: { flexDirection: 'row', gap: 8 },
  searchInput: { flex: 1, minHeight: 44, backgroundColor: colors.surface, borderWidth: 0.8, borderColor: colors.border, borderRadius: radius.button, paddingHorizontal: 12, color: colors.text, fontFamily: typography.regular },
  searchButton: { minWidth: 62, borderRadius: radius.button, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  searchLabel: { color: colors.surface, fontFamily: typography.bold },
  filterTitle: { color: colors.text, fontFamily: typography.bold, fontSize: 13 },
  filters: { gap: 8, paddingRight: 16 },
  message: { color: colors.textSecondary, fontFamily: typography.regular, fontSize: 13, lineHeight: 19 },
  error: { color: colors.error, fontFamily: typography.regular, fontSize: 12 },
  state: { gap: 10 }, heading: { color: colors.text, fontFamily: typography.bold, fontSize: 15 },
  applications: { gap: 10, marginTop: 12 },
  application: { backgroundColor: colors.surface, borderWidth: 0.8, borderColor: colors.border, borderRadius: radius.card, padding: 12, gap: 4 },
  applicationTitle: { color: colors.text, fontFamily: typography.semibold, fontSize: 13 },
});
