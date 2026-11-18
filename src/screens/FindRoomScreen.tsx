import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Text as TamaText, XStack } from 'tamagui';

import { EmptyState } from '../components/ui/EmptyState';
import { AppButton } from '../components/ui/AppButton';
import { FilterChip } from '../components/ui/FilterChip';
import { RoomCard } from '../components/ui/RoomCard';
import { ScreenContainer } from '../components/ui/ScreenContainer';
import { SearchBar } from '../components/ui/SearchBar';
import { StudentHeader } from '../components/ui/ResidenceUi';
import { FilterSheet } from './FilterScreen';
import { emptyRoomFilters } from '../constants/roomFilters';
import { getStudentAvailableRooms } from '../api/residence';
import { ApiError } from '../api/httpClient';
import { colors, typography } from '../theme';
import type { ResidenceStackParamList } from '../types/navigation';
import type { RoomFilter, RoomListItem, RoomSearchFilters } from '../types/room';
import { roomDtoToListItem } from '../utils/room';

const chips: { id: RoomFilter; label: string }[] = [{ id: 'all', label: 'Tất cả' }, { id: 'buildingA', label: 'Tòa A' }, { id: 'buildingB', label: 'Tòa B' }, { id: 'under1500000', label: 'Dưới 1.5tr' }, { id: 'available', label: 'Còn chỗ' }];
export function FindRoomScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ResidenceStackParamList>>();
  const [loadedRooms, setLoadedRooms] = useState<readonly RoomListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string>();
  const [reload, setReload] = useState(0);
  useEffect(() => {
    let active = true;
    setLoading(true); setLoadError(undefined);
    getStudentAvailableRooms().then((result) => { if (active) setLoadedRooms(result.data.map(roomDtoToListItem)); })
      .catch((error: unknown) => { if (active) setLoadError(error instanceof ApiError ? error.message : 'Không tải được danh sách phòng. Vui lòng thử lại.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [reload]);
  const [query, setQuery] = useState('');
  const [chip, setChip] = useState<RoomFilter>('all');
  const [advanced, setAdvanced] = useState<RoomSearchFilters>(emptyRoomFilters);
  const [filterVisible, setFilterVisible] = useState(false);
  const rooms = useMemo(() => loadedRooms.filter((room) => {
    const queryMatch = `${room.name} ${room.building}`.toLocaleLowerCase('vi-VN').includes(query.trim().toLocaleLowerCase('vi-VN'));
    const chipMatch = chip === 'all' || (chip === 'buildingA' && room.building === 'Tòa A') || (chip === 'buildingB' && room.building === 'Tòa B') || (chip === 'under1500000' && room.monthlyPrice < 1500000) || (chip === 'available' && room.occupied < room.capacity);
    const advancedMatch = (!advanced.building || room.building === advanced.building) && (!advanced.capacity || room.capacity === advanced.capacity) && (!advanced.onlyAvailable || room.occupied < room.capacity) && (!advanced.price || (advanced.price === 'under1m' && room.monthlyPrice < 1000000) || (advanced.price === '1mTo1_5m' && room.monthlyPrice >= 1000000 && room.monthlyPrice <= 1500000) || (advanced.price === 'over1_5m' && room.monthlyPrice > 1500000));
    return queryMatch && chipMatch && advancedMatch;
  }), [loadedRooms, query, chip, advanced]);
  const count = rooms.filter((room) => room.occupied < room.capacity).length;
  return <ScreenContainer><StatusBar style="dark" /><ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}><StudentHeader /><SearchBar value={query} onChangeText={setQuery} onFilterPress={() => setFilterVisible(true)} /><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>{chips.map((item) => <FilterChip key={item.id} label={item.label} selected={chip === item.id} onPress={() => setChip(item.id)} />)}</ScrollView><XStack style={styles.resultRow}><TamaText style={styles.result}>Tìm thấy {count} phòng còn trống</TamaText><AppButton compact variant="text" title="Lịch sử đơn" onPress={() => navigation.navigate('ApplicationHistory')} /></XStack>{loading ? <ActivityIndicator color={colors.primary} size="large" /> : null}{loadError ? <View style={styles.errorBox}><Text style={styles.error}>{loadError}</Text><Pressable onPress={() => setReload((value) => value + 1)}><Text style={styles.retry}>Thử lại</Text></Pressable></View> : null}{!loading && !loadError && rooms.length ? rooms.map((room) => <RoomCard key={room.id} room={room} onPress={() => navigation.navigate('StudentRoomDetail', { roomId: room.id })} />) : null}{!loading && !loadError && rooms.length === 0 ? <EmptyState /> : null}</ScrollView><Modal transparent visible={filterVisible} animationType="fade" onRequestClose={() => setFilterVisible(false)}><FilterSheet initialFilters={advanced} onClose={() => setFilterVisible(false)} onApply={(filters) => { setAdvanced(filters); setFilterVisible(false); }} /></Modal></ScreenContainer>;
}
const styles = StyleSheet.create({ content: { paddingHorizontal: 16, paddingBottom: 24, gap: 14 }, chips: { flexDirection: 'row', gap: 8, paddingVertical: 2, paddingRight: 16 }, resultRow: { alignItems: 'center', justifyContent: 'space-between', gap: 8 }, result: { color: colors.textSecondary, fontFamily: typography.regular, fontSize: 12.5, marginTop: 8 }, errorBox: { padding: 14, gap: 8, backgroundColor: colors.rejectionBackground, borderRadius: 10 }, error: { color: colors.rejectionText, fontFamily: typography.regular, fontSize: 12.5 }, retry: { color: colors.primary, fontFamily: typography.bold, fontSize: 13 } });
