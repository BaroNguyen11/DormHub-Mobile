import { Button, Text } from 'tamagui';

import { colors, radius, typography } from '../../theme';

type Variant = 'primary' | 'outline' | 'text';

interface Props {
  title: string;
  onPress: () => void;
  variant?: Variant;
  compact?: boolean;
  disabled?: boolean;
}

export function AppButton({ title, onPress, variant = 'primary', compact = false, disabled = false }: Props) {
  const backgroundColor = disabled ? colors.disabled : variant === 'primary' ? colors.primary : variant === 'outline' ? colors.surface : 'transparent';
  const labelColor = variant === 'primary' ? colors.surface : variant === 'outline' ? colors.text : colors.primary;

  return <Button
    size={false}
    accessibilityRole="button"
    accessibilityState={{ disabled }}
    disabled={disabled}
    onPress={onPress}
    height={compact ? 38 : 48}
    paddingHorizontal={compact ? 16 : 0}
    borderRadius={radius.button}
    borderWidth={variant === 'outline' && !disabled ? 0.8 : 0}
    borderColor={colors.primary}
    backgroundColor={backgroundColor}
    alignItems="center"
    justifyContent="center"
    opacity={disabled ? 1 : '1 press:0.75'}
  >
    <Text color={labelColor} fontFamily="body" fontWeight="700" fontSize={typography.button} textAlign="center">{title}</Text>
  </Button>;
}
