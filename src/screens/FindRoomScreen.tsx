import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Text as TamaText } from 'tamagui';

import { EmptyState } from '../components/ui/EmptyState';
import { FilterChip } from '../components/ui/FilterChip';
import { RoomCard } from '../components/ui/RoomCard';
import { ScreenContainer } from '../components/ui/ScreenContainer';
import { SearchBar } from '../components/ui/SearchBar';
import { StudentHeader } from '../components/ui/ResidenceUi';
import { FilterSheet } from './FilterScreen';
import { designFilterPreset, emptyRoomFilters, exploreRooms, initialAvailableResultCount } from '../mocks/rooms';
import { colors, typography } from '../theme';
import type { ResidenceStackParamList, RootStackParamList, StudentTabsParamList } from '../types/navigation';
import type { RoomFilter, RoomSearchFilters } from '../types/room';

const chips: { id: RoomFilter; label: string }[] = [{ id: 'all', label: 'Tất cả' }, { id: 'buildingA', label: 'Tòa A' }, { id: 'buildingB', label: 'Tòa B' }, { id: 'under1500000', label: 'Dưới 1.5tr' }, { id: 'available', label: 'Còn chỗ' }];
export function FindRoomScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ResidenceStackParamList>>();
  const [query, setQuery] = useState('');
  const [chip, setChip] = useState<RoomFilter>('all');
  const [advanced, setAdvanced] = useState<RoomSearchFilters>(emptyRoomFilters);
  const [filterVisible, setFilterVisible] = useState(false);
  const rooms = useMemo(() => exploreRooms.filter((room) => {
    const queryMatch = `${room.name} ${room.building}`.toLocaleLowerCase('vi-VN').includes(query.trim().toLocaleLowerCase('vi-VN'));
    const chipMatch = chip === 'all' || (chip === 'buildingA' && room.building === 'Tòa A') || (chip === 'buildingB' && room.building === 'Tòa B') || (chip === 'under1500000' && room.monthlyPrice < 1500000) || (chip === 'available' && room.occupied < room.capacity);
    const advancedMatch = (!advanced.building || room.building === advanced.building) && (!advanced.capacity || room.capacity === advanced.capacity) && (!advanced.onlyAvailable || room.occupied < room.capacity) && (!advanced.price || (advanced.price === 'under1m' && room.monthlyPrice < 1000000) || (advanced.price === '1mTo1_5m' && room.monthlyPrice >= 1000000 && room.monthlyPrice <= 1500000) || (advanced.price === 'over1_5m' && room.monthlyPrice > 1500000));
    return queryMatch && chipMatch && advancedMatch;
  }), [query, chip, advanced]);
  const defaultFilters = !advanced.building && !advanced.price && !advanced.capacity && !advanced.onlyAvailable;
  const count = query.trim() === '' && chip === 'all' && defaultFilters ? initialAvailableResultCount : rooms.filter((room) => room.occupied < room.capacity).length;
  return <ScreenContainer><StatusBar style="dark" /><ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}><StudentHeader onMessage={() => navigation.getParent<BottomTabNavigationProp<StudentTabsParamList>>()?.getParent<NativeStackNavigationProp<RootStackParamList>>()?.navigate('Chat')} /><SearchBar value={query} onChangeText={setQuery} onFilterPress={() => setFilterVisible(true)} /><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>{chips.map((item) => <FilterChip key={item.id} label={item.label} selected={chip === item.id} onPress={() => setChip(item.id)} />)}</ScrollView><TamaText style={styles.result}>Tìm thấy {count} phòng còn trống</TamaText>{rooms.length ? rooms.map((room) => <RoomCard key={room.id} room={room} onPress={() => navigation.navigate('StudentRoomDetail', { roomId: room.id })} />) : <EmptyState />}</ScrollView><Modal transparent visible={filterVisible} animationType="fade" onRequestClose={() => setFilterVisible(false)}><FilterSheet initialFilters={defaultFilters ? designFilterPreset : advanced} onClose={() => setFilterVisible(false)} onApply={(filters) => { setAdvanced(filters); setFilterVisible(false); }} /></Modal></ScreenContainer>;
}
const styles = StyleSheet.create({ content: { paddingHorizontal: 16, paddingBottom: 24, gap: 14 }, chips: { flexDirection: 'row', gap: 8, paddingVertical: 2, paddingRight: 16 }, result: { color: colors.textSecondary, fontFamily: typography.regular, fontSize: 12.5, marginTop: 8 } });
