import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, typography } from '../../theme';

interface Props { onExplorePress: () => void; onAccountPress: () => void }

export function GuestBottomBar({ onExplorePress, onAccountPress }: Props) {
  return (
    <View style={styles.bar}>
      <Pressable accessibilityRole="tab" accessibilityState={{ selected: true }} onPress={onExplorePress} style={styles.item}>
        <Image source={require('../../../assets/figma/explore-home.svg')} style={styles.icon} />
        <Text style={[styles.label, styles.active]}>Khám phá</Text>
      </Pressable>
      <Pressable accessibilityRole="tab" onPress={onAccountPress} style={styles.item}>
        <Image source={require('../../../assets/figma/explore-account.svg')} style={styles.icon} />
        <Text style={styles.label}>Tài khoản</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { height: 64, flexDirection: 'row', borderTopWidth: 0.8, borderColor: colors.border, backgroundColor: colors.surface },
  item: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 3 },
  icon: { width: 21, height: 21 },
  label: { fontFamily: typography.semibold, fontSize: typography.tab, color: colors.inactiveTab },
  active: { color: colors.primary },
});
