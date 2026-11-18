import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SectionList, StyleSheet, Text, Pressable, View } from 'react-native';
import { Text as TamaText, YStack } from 'tamagui';

import { NotificationRow } from '../components/ui/NotificationUi';
import { ScreenContainer } from '../components/ui/ScreenContainer';
import { useNotifications } from '../context/NotificationContext';
import { colors, typography } from '../theme';
import type { NotificationStackParamList } from '../types/navigation';
import { notificationSections } from '../utils/notification';

type Props = NativeStackScreenProps<NotificationStackParamList, 'NotificationCenter'>;

export function NotificationCenterScreen({ navigation }: Props) {
  const { notifications, markAllRead, refreshNotifications, loading, error } = useNotifications();
  const nowIso = new Date().toISOString();
  useFocusEffect(useCallback(() => { void refreshNotifications().catch(() => undefined); }, [refreshNotifications]));
  const sections = notificationSections(notifications, nowIso);

  return <ScreenContainer>
    <StatusBar style="dark" />
    <YStack style={styles.header}><TamaText style={styles.headerTitle}>Thông báo</TamaText></YStack>
    <SectionList
      sections={sections}
      keyExtractor={(item) => item.id}
      stickySectionHeadersEnabled={false}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.content}
      ListHeaderComponent={notifications.length ? <Pressable accessibilityRole="button" onPress={() => { void markAllRead().catch(() => undefined); }} style={styles.markAll}><Text style={styles.markAllText}>Đánh dấu đã đọc tất cả</Text></Pressable> : undefined}
      renderSectionHeader={({ section }) => <TamaText style={[styles.sectionTitle, section.title !== sections[0]?.title && styles.laterSection]}>{section.title}</TamaText>}
      renderItem={({ item }) => <NotificationRow item={item} nowIso={nowIso} onPress={() => navigation.navigate('NotificationDetail', { notificationId: item.id })} />}
      ItemSeparatorComponent={() => <View style={styles.itemGap} />}
      ListEmptyComponent={loading ? <ActivityIndicator color={colors.primary} style={styles.empty} /> : error ? <YStack style={styles.empty}><TamaText style={styles.emptyBody}>{error}</TamaText><Pressable onPress={() => void refreshNotifications().catch(() => undefined)}><Text style={styles.markAllText}>Thử lại</Text></Pressable></YStack> : <YStack style={styles.empty}><TamaText style={styles.emptyTitle}>Chưa có thông báo</TamaText><TamaText style={styles.emptyBody}>Thông báo mới sẽ xuất hiện tại đây.</TamaText></YStack>}
    />
  </ScreenContainer>;
}

const styles = StyleSheet.create({
  header: { height: 52, paddingHorizontal: 14, justifyContent: 'center', backgroundColor: colors.surface, borderBottomWidth: 0.8, borderBottomColor: colors.border },
  headerTitle: { color: colors.text, fontFamily: typography.bold, fontSize: 18 },
  content: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 24 },
  markAll: { alignSelf: 'flex-end', marginBottom: 10, paddingVertical: 2 },
  markAllText: { color: colors.primary, fontFamily: typography.bold, fontSize: 12.5 },
  sectionTitle: { color: colors.text, fontFamily: typography.bold, fontSize: 14, marginBottom: 7 },
  itemGap: { height: 6 },
  laterSection: { marginTop: 12 },
  empty: { alignItems: 'center', paddingTop: 72, paddingHorizontal: 16 },
  emptyTitle: { color: colors.text, fontFamily: typography.bold, fontSize: 16 },
  emptyBody: { color: colors.textSecondary, fontFamily: typography.regular, fontSize: typography.body, marginTop: 8, textAlign: 'center' },
});
