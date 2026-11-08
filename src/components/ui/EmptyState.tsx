import { StyleSheet } from 'react-native';
import { Text, YStack } from 'tamagui';

import { colors, typography } from '../../theme';

export function EmptyState() {
  return (
    <YStack style={styles.container}>
      <Text style={styles.title}>Không tìm thấy phòng phù hợp</Text>
      <Text style={styles.body}>Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm.</Text>
    </YStack>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingTop: 48, paddingHorizontal: 16 },
  title: { color: colors.text, fontFamily: typography.bold, fontSize: 16 },
  body: { color: colors.textSecondary, fontFamily: typography.regular, fontSize: typography.body, textAlign: 'center', marginTop: 12 },
});
