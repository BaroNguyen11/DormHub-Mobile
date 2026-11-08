import { useNavigation } from '@react-navigation/native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ScreenContainer } from '../components/ui/ScreenContainer';
import { colors, typography } from '../theme';

interface Props { title: string }

export function PlaceholderScreen({ title }: Props) {
  const navigation = useNavigation();
  return (
    <ScreenContainer>
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.body}>Chức năng này tạm thời chưa thể sử dụng. Vui lòng thử lại sau.</Text>
        {navigation.canGoBack() && (
          <Pressable accessibilityRole="button" onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backLabel}>Quay lại</Text>
          </Pressable>
        )}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  title: { color: colors.text, fontFamily: typography.bold, fontSize: 20 },
  body: { color: colors.textSecondary, fontFamily: typography.regular, fontSize: 13, marginTop: 8, textAlign: 'center' },
  backButton: { marginTop: 24, padding: 12 },
  backLabel: { color: colors.primary, fontFamily: typography.semibold, fontSize: 14 },
});
