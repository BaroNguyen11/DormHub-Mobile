import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet } from 'react-native';
import { Card, Text as TamaText, YStack } from 'tamagui';
import { exploreRooms } from '../../mocks/rooms';
import { colors, radius, typography } from '../../theme';

export function ApplicationRoomCard({ roomId, subtitle }: { roomId: string; subtitle: string }) {
  const room = exploreRooms.find((item) => item.id === roomId);
  if (!room) return null;
  return <Card size={false} style={styles.card}><LinearGradient colors={[colors.roomImageGradientStart, colors.roomImageGradientEnd]} start={{ x: 0, y: 1 }} end={{ x: 1, y: 0 }} style={styles.thumb}><Image source={require('../../../assets/figma/room-placeholder.svg')} style={styles.icon} /></LinearGradient><YStack style={styles.copy}><TamaText style={styles.title}>{room.name} · {room.building}</TamaText><TamaText style={styles.subtitle}>{subtitle}</TamaText></YStack></Card>;
}
const styles = StyleSheet.create({ card: { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 0.8, borderRadius: radius.card, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 }, thumb: { width: 64, height: 64, borderRadius: radius.card, justifyContent: 'center', alignItems: 'center' }, icon: { width: 22, height: 22 }, copy: { flex: 1 }, title: { color: colors.text, fontFamily: typography.bold, fontSize: 13.5 }, subtitle: { color: colors.textSecondary, fontFamily: typography.regular, fontSize: 12, marginTop: 3 } });
