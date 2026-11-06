import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, radius, typography } from '../../theme';

interface Props { label: string; selected: boolean; onPress: () => void }

export function FilterChip({ label, selected, onPress }: Props) {
  return (
    <Pressable accessibilityRole="button" accessibilityState={{ selected }} onPress={onPress} style={[styles.chip, selected && styles.selected]}>
      <Text style={[styles.label, selected && styles.selectedLabel]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: { height: 34, paddingHorizontal: 14, borderRadius: radius.pill, borderWidth: 0.8, borderColor: colors.border, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  selected: { backgroundColor: colors.primary, borderColor: colors.primary },
  label: { color: colors.textSecondary, fontFamily: typography.semibold, fontSize: 12.5 },
  selectedLabel: { color: colors.surface },
});
