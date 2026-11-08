import { StyleSheet, Text, View } from 'react-native';
import { colors, typography } from '../../theme';

export function UnavailableState({ message }: { message: string }) {
  return <View style={styles.container}><Text style={styles.message}>{message}</Text></View>;
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24 },
  message: { color: colors.textSecondary, fontFamily: typography.regular, fontSize: 14, lineHeight: 21, textAlign: 'center' },
});
