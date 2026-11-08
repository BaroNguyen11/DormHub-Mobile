import { defaultConfig } from '@tamagui/config/v6';
import { createFont, createTamagui } from 'tamagui';

import { colors, radius, spacing, typography } from './src/theme';

const roboto = createFont({
  family: typography.regular,
  size: {
    ...defaultConfig.fonts.body.size,
    1: typography.badge,
    2: typography.body,
    3: typography.cardTitle,
    4: typography.button,
    5: typography.cardPrice,
    6: typography.welcomeTitle,
    7: typography.splashTitle,
  },
  lineHeight: { ...defaultConfig.fonts.body.lineHeight, 1: 16, 2: 18, 3: 20, 4: 21, 5: 23, 6: 29, 7: 32 },
  weight: { 4: '400', 6: '600', 7: '700' },
  face: {
    400: { normal: typography.regular },
    600: { normal: typography.semibold },
    700: { normal: typography.bold },
  },
});

export const tamaguiConfig = createTamagui({
  ...defaultConfig,
  settings: { ...defaultConfig.settings, onlyAllowShorthands: false },
  fonts: { ...defaultConfig.fonts, body: roboto, heading: roboto },
  tokens: {
    ...defaultConfig.tokens,
    color: { ...defaultConfig.tokens.color, ...colors },
    space: {
      ...defaultConfig.tokens.space,
      dormXs: spacing.xs,
      dormSm: spacing.sm,
      dormChipGap: spacing.chipGap,
      dormButtonGap: spacing.buttonGap,
      dormCardGap: spacing.cardGap,
      dormSection: spacing.section,
      dormContent: spacing.content,
      dormWelcomeHorizontal: spacing.welcomeHorizontal,
      dormWelcomeTop: spacing.welcomeTop,
      dormWelcomeSectionGap: spacing.welcomeSectionGap,
    },
    size: { ...defaultConfig.tokens.size, dormButton: 48, dormCompactButton: 38, dormField: 46 },
    radius: {
      ...defaultConfig.tokens.radius,
      dormSmall: radius.small,
      dormButton: radius.button,
      dormCard: radius.card,
      dormSplashIcon: radius.splashIcon,
      dormPill: radius.pill,
    },
  },
  themes: {
    ...defaultConfig.themes,
    light: {
      ...defaultConfig.themes.light,
      ...colors,
      background: colors.background,
      color: colors.text,
      primary: colors.primary,
      surface: colors.surface,
      borderColor: colors.border,
      placeholderColor: colors.placeholder,
    },
  },
});

export type TamaguiConfig = typeof tamaguiConfig;

declare module 'tamagui' {
  interface TamaguiCustomConfig extends TamaguiConfig {}
}
