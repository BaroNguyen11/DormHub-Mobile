import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet } from 'react-native';
import { Text, XStack, YStack } from 'tamagui';

import { AppButton } from '../components/ui/AppButton';
import { EmptyState } from '../components/ui/EmptyState';
import { FilterChip } from '../components/ui/FilterChip';
import { GuestBottomBar } from '../components/ui/GuestBottomBar';
import { RoomCard } from '../components/ui/RoomCard';
import { ScreenContainer } from '../components/ui/ScreenContainer';
import { SearchBar } from '../components/ui/SearchBar';
import { getPublicAvailableRooms } from '../api/residence';
import { ApiError } from '../api/httpClient';
import { emptyRoomFilters } from '../constants/roomFilters';
import { colors, spacing, typography } from '../theme';
import type { GuestStackParamList } from '../types/navigation';
import type { RoomFilter, RoomListItem } from '../types/room';
import { roomDtoToListItem } from '../utils/room';
import { useEffect } from 'react';

type Props = NativeStackScreenProps<GuestStackParamList, 'Explore'>;

const filters: { id: RoomFilter; label: string }[] = [
  { id: 'all', label: 'Tất cả' }, { id: 'buildingA', label: 'Tòa A' },
  { id: 'buildingB', label: 'Tòa B' }, { id: 'under1500000', label: 'Dưới 1.5tr' },
  { id: 'available', label: 'Còn chỗ' },
];

export function ExploreScreen({ navigation, route }: Props) {
  const [rooms, setRooms] = useState<readonly RoomListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string>();
  const [reload, setReload] = useState(0);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<RoomFilter>('all');
  const advanced = route.params?.filters ?? emptyRoomFilters;
  useEffect(() => {
    let active = true;
    setLoading(true);
    setLoadError(undefined);
    getPublicAvailableRooms()
      .then((result) => { if (active) setRooms(result.data.map(roomDtoToListItem)); })
      .catch((error: unknown) => { if (active) setLoadError(error instanceof ApiError ? error.message : 'Không tải được danh sách phòng. Vui lòng thử lại.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [reload]);
  const visibleRooms = useMemo(() => rooms.filter((room) => {
    const matchesQuery = `${room.name} ${room.building}`.toLocaleLowerCase('vi-VN').includes(query.trim().toLocaleLowerCase('vi-VN'));
    const matchesFilter = filter === 'all' ||
      (filter === 'buildingA' && room.building === 'Tòa A') ||
      (filter === 'buildingB' && room.building === 'Tòa B') ||
      (filter === 'under1500000' && room.monthlyPrice < 1500000) ||
      (filter === 'available' && room.occupied < room.capacity);
    const matchesAdvanced = (!advanced.building || room.building === advanced.building) &&
      (!advanced.price || (advanced.price === 'under1m' && room.monthlyPrice < 1000000) || (advanced.price === '1mTo1_5m' && room.monthlyPrice >= 1000000 && room.monthlyPrice <= 1500000) || (advanced.price === 'over1_5m' && room.monthlyPrice > 1500000)) &&
      (!advanced.capacity || room.capacity === advanced.capacity) &&
      (!advanced.onlyAvailable || room.occupied < room.capacity);
    return matchesQuery && matchesFilter && matchesAdvanced;
  }), [rooms, query, filter, advanced]);

  const noAdvanced = !advanced.building && !advanced.price && !advanced.capacity && !advanced.onlyAvailable;
  const resultCount = visibleRooms.length;

  return (
    <ScreenContainer backgroundColor={colors.surface}>
      <StatusBar hidden={false} style="dark" />
      <YStack style={styles.body}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <XStack style={styles.header}>
            <YStack>
              <Text style={styles.greeting}>Chào bạn 👋</Text>
              <Text style={styles.heading}>Tìm phòng phù hợp với bạn</Text>
            </YStack>
            <YStack style={styles.loginButton}><AppButton compact title="Đăng nhập" onPress={() => navigation.navigate('Login')} /></YStack>
          </XStack>
          <SearchBar value={query} onChangeText={setQuery} onFilterPress={() => navigation.navigate('Filter', { initialFilters: advanced })} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
            {filters.map((item) => <FilterChip key={item.id} label={item.label} selected={filter === item.id} onPress={() => setFilter(item.id)} />)}
          </ScrollView>
          <Text style={styles.resultCount}>Tìm thấy {resultCount} phòng còn trống</Text>
          {loading ? <ActivityIndicator color={colors.primary} size="large" /> : null}
          {loadError ? <YStack style={styles.errorState}><Text style={styles.errorText}>{loadError}</Text><Pressable accessibilityRole="button" onPress={() => setReload((value) => value + 1)}><Text style={styles.retry}>Thử lại</Text></Pressable></YStack> : null}
          {!loading && !loadError && visibleRooms.length === 0 ? <EmptyState /> : null}
          {!loading && !loadError ? visibleRooms.map((room) => <RoomCard key={room.id} room={room} onPress={() => navigation.navigate('RoomDetail', { roomId: room.id })} />) : null}
        </ScrollView>
      </YStack>
      <GuestBottomBar onExplorePress={() => undefined} onAccountPress={() => navigation.navigate('Login')} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.content, gap: spacing.cardGap, paddingBottom: 24 },
  header: { height: 66, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  greeting: { color: colors.textSecondary, fontFamily: typography.regular, fontSize: 10, marginTop: 5 },
  heading: { color: colors.text, fontFamily: typography.bold, fontSize: 13 },
  loginButton: { width: 122 },
  chips: { flexDirection: 'row', gap: spacing.chipGap, paddingRight: 16, height: 49, alignItems: 'flex-start' },
  resultCount: { color: colors.textSecondary, fontFamily: typography.regular, fontSize: typography.body }, errorState: { backgroundColor: colors.rejectionBackground, borderColor: colors.rejectionBorder, borderWidth: 1, borderRadius: 10, padding: 14, gap: 8 }, errorText: { color: colors.rejectionText, fontFamily: typography.regular, fontSize: 12.5 }, retry: { color: colors.primary, fontFamily: typography.bold, fontSize: 13 },
});
