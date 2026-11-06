import type { PropsWithChildren } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors } from '../../theme';

interface Props extends PropsWithChildren {
  backgroundColor?: string;
}

export function ScreenContainer({ children, backgroundColor = colors.background }: Props) {
  return <SafeAreaView edges={['top', 'bottom']} style={[styles.root, { backgroundColor }]}>{children}</SafeAreaView>;
}

const styles = StyleSheet.create({ root: { flex: 1 } });
