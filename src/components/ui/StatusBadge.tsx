import { Text, XStack } from 'tamagui';

import { colors, radius, typography } from '../../theme';

interface Props { available: number }

export function StatusBadge({ available }: Props) {
  const full = available <= 0;
  const limited = available === 1;
  const backgroundColor = full ? colors.fullBackground : limited ? colors.limitedBackground : colors.availableBackground;
  const color = full ? colors.textSecondary : limited ? colors.limitedText : colors.availableText;

  return <XStack height={22} paddingHorizontal={10} borderRadius={radius.pill} backgroundColor={backgroundColor} alignItems="center" justifyContent="center">
    <Text color={color} fontFamily="body" fontWeight="700" fontSize={typography.badge}>{full ? 'Đã đầy' : `Còn ${available} chỗ`}</Text>
  </XStack>;
}
