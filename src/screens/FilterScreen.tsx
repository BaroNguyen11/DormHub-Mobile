import { Feather } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet } from 'react-native';
import { Text, XStack, YStack } from 'tamagui';

import { AppButton } from '../components/ui/AppButton';
import { FilterChip } from '../components/ui/FilterChip';
import { emptyRoomFilters } from '../mocks/rooms';
import { colors, radius, typography } from '../theme';
import type { GuestStackParamList } from '../types/navigation';
import type { RoomSearchFilters } from '../types/room';

type Props = NativeStackScreenProps<GuestStackParamList, 'Filter'>;
type Key = 'building' | 'price' | 'capacity';
const options = {
  building: [{ value: 'Tòa A', label: 'Tòa A' }, { value: 'Tòa B', label: 'Tòa B' }, { value: 'Tòa C', label: 'Tòa C' }],
  price: [{ value: 'under1m', label: 'Dưới 1tr' }, { value: '1mTo1_5m', label: '1 - 1.5tr' }, { value: 'over1_5m', label: 'Trên 1.5tr' }],
  capacity: [{ value: 2, label: '2 người' }, { value: 4, label: '4 người' }, { value: 6, label: '6 người' }],
} as const;

export function FilterScreen({ navigation, route }: Props) {
  return <FilterSheet initialFilters={route.params.initialFilters} onClose={() => navigation.goBack()} onApply={(filters) => navigation.popTo('Explore', { filters })} />;
}

interface FilterSheetProps { initialFilters: RoomSearchFilters; onClose: () => void; onApply: (filters: RoomSearchFilters) => void }
export function FilterSheet({ initialFilters, onClose, onApply }: FilterSheetProps) {
  const [filters, setFilters] = useState<RoomSearchFilters>(initialFilters);
  const setOption = <K extends Key>(key: K, value: RoomSearchFilters[K]) => setFilters((previous) => ({ ...previous, [key]: previous[key] === value ? null : value }));
  const apply = () => onApply(filters);
  return (
    <YStack style={styles.overlay}>
      <Pressable style={styles.scrim} onPress={onClose} accessibilityLabel="Đóng bộ lọc" />
      <YStack style={styles.sheet}>
        <YStack style={styles.handle} />
        <XStack style={styles.header}><Text style={styles.title}>Bộ lọc</Text><Pressable onPress={onClose} accessibilityLabel="Đóng"><Feather name="x" size={22} color={colors.text} /></Pressable></XStack>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.sections}>
          <YStack><Text style={styles.label}>Tòa nhà</Text><XStack style={styles.chips}>{options.building.map((item) => <FilterChip key={item.value} label={item.label} selected={filters.building === item.value} onPress={() => setOption('building', item.value)} />)}</XStack></YStack>
          <YStack><Text style={styles.label}>Mức giá</Text><XStack style={styles.chips}>{options.price.map((item) => <FilterChip key={item.value} label={item.label} selected={filters.price === item.value} onPress={() => setOption('price', item.value)} />)}</XStack></YStack>
          <YStack><Text style={styles.label}>Loại phòng</Text><XStack style={styles.chips}>{options.capacity.map((item) => <FilterChip key={item.value} label={item.label} selected={filters.capacity === item.value} onPress={() => setOption('capacity', item.value)} />)}</XStack></YStack>
          <YStack><Text style={styles.label}>Tình trạng</Text><XStack style={styles.chips}><FilterChip label="Còn chỗ trống" selected={filters.onlyAvailable} onPress={() => setFilters((previous) => ({ ...previous, onlyAvailable: !previous.onlyAvailable }))} /></XStack></YStack>
        </ScrollView>
        <XStack style={styles.actions}><YStack style={styles.action}><AppButton title="Đặt lại" variant="outline" onPress={() => setFilters(emptyRoomFilters)} /></YStack><YStack style={styles.action}><AppButton title="Áp dụng" onPress={apply} /></YStack></XStack>
      </YStack>
    </YStack>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' }, scrim: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(0,0,0,0.42)' },
  sheet: { height: '49%', minHeight: 400, maxHeight: 500, backgroundColor: colors.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingHorizontal: 20, paddingBottom: 24 },
  handle: { width: 42, height: 4, borderRadius: radius.pill, backgroundColor: colors.border, alignSelf: 'center', marginTop: 10 },
  header: { height: 58, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, title: { fontFamily: typography.bold, color: colors.text, fontSize: 18 },
  sections: { gap: 19, paddingBottom: 12 }, label: { fontFamily: typography.bold, color: colors.text, fontSize: 13, marginBottom: 10 }, chips: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  actions: { flexDirection: 'row', gap: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.border }, action: { flex: 1 },
});
