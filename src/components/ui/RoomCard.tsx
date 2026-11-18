import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';
import { Card } from 'tamagui';

import { colors, radius, typography } from '../../theme';
import type { RoomListItem } from '../../types/room';
import { StatusBadge } from './StatusBadge';

interface Props { room: RoomListItem; onPress: () => void }

export function RoomCard({ room, onPress }: Props) {
  const available = room.capacity - room.occupied;
  return (
    <Card size={false} accessibilityRole="button" onPress={onPress} style={[styles.card, available === 0 && styles.full]}>
      <LinearGradient colors={[colors.roomImageGradientStart, colors.roomImageGradientEnd]} start={{ x: 0, y: 1 }} end={{ x: 1, y: 0 }} style={styles.thumbnail}>
        <Image source={require('../../../assets/figma/room-placeholder.svg')} style={styles.thumbnailIcon} />
      </LinearGradient>
      <View style={styles.details}>
        <View style={styles.heading}>
          <View style={styles.nameBlock}>
            <Text style={styles.name} numberOfLines={1}>{room.name}</Text>
            <Text style={styles.location}>{room.building} · Tầng {room.floor}</Text>
          </View>
          <StatusBadge available={available} />
        </View>
        <View style={styles.priceRow}>
          <Text style={styles.price}>{room.monthlyPrice.toLocaleString('vi-VN')}đ</Text>
          <Text style={styles.priceUnit}>/ tháng</Text>
        </View>
        <Text style={styles.summary}>{room.occupied}/{room.capacity} người{room.amenity ? ` · ${room.amenity}` : ''}</Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { height: 118, flexDirection: 'row', padding: 14, borderRadius: radius.card, borderWidth: 0.8, borderColor: colors.border, backgroundColor: colors.surface, gap: 12 },
  full: { opacity: 0.55 },
  thumbnail: { width: 88, height: 88, borderRadius: radius.card, alignItems: 'center', justifyContent: 'center' },
  thumbnailIcon: { width: 26, height: 26 },
  details: { flex: 1, maxWidth: 189, height: 88 },
  heading: { height: 34, flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  nameBlock: { flexShrink: 1, marginRight: 4 },
  name: { fontFamily: typography.semibold, fontSize: typography.cardTitle, color: colors.text },
  location: { fontFamily: typography.regular, fontSize: typography.caption, color: colors.textSecondary },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 5, marginTop: 7 },
  price: { fontFamily: typography.regular, fontSize: typography.cardPrice, color: colors.text },
  priceUnit: { fontFamily: typography.regular, fontSize: typography.body, color: colors.textSecondary },
  summary: { marginTop: 2, fontFamily: typography.regular, fontSize: typography.body, color: colors.textSecondary },
});
