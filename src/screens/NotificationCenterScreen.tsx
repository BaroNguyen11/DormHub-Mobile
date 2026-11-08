import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, Pressable, SectionList, StyleSheet, Text, View } from 'react-native';

import { NotificationRow } from '../components/ui/NotificationUi';
import { ScreenContainer } from '../components/ui/ScreenContainer';
import { useNotifications } from '../context/NotificationContext';
import { colors, typography } from '../theme';
import type { NotificationStackParamList } from '../types/navigation';
import { notificationSections } from '../utils/notification';

type Props = NativeStackScreenProps<NotificationStackParamList, 'NotificationCenter'>;

export function NotificationCenterScreen({ navigation }: Props) {
  const { notifications, unreadCount, isLoading, hasMore, error, markAllRead, loadMore } = useNotifications();
  const nowIso = new Date().toISOString();
  const sections = notificationSections(notifications, nowIso);

  return <ScreenContainer>
    <StatusBar style="dark" />
    <View style={styles.header}><Text style={styles.headerTitle}>Thông báo</Text></View>
    <SectionList
      sections={sections}
      keyExtractor={(item) => item.id}
      stickySectionHeadersEnabled={false}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.content}
      ListHeaderComponent={notifications.length ? <View>{error ? <Text style={styles.error}>{error}</Text> : null}{notifications.some((item) => !item.isRead) ? <Pressable accessibilityRole="button" disabled={isLoading || unreadCount === 0} onPress={markAllRead} style={styles.markAll}><Text style={styles.markAllText}>Đánh dấu đã đọc tất cả</Text></Pressable> : null}</View> : error ? <Text style={styles.error}>{error}</Text> : undefined}
      renderSectionHeader={({ section }) => <Text style={[styles.sectionTitle, section.title !== sections[0]?.title && styles.laterSection]}>{section.title}</Text>}
      renderItem={({ item }) => <NotificationRow item={item} nowIso={nowIso} onPress={() => navigation.navigate('NotificationDetail', { notificationId: item.id })} />}
      ItemSeparatorComponent={() => <View style={styles.itemGap} />}
      onEndReached={() => { if (hasMore && !isLoading) loadMore(); }}
      onEndReachedThreshold={0.35}
      ListFooterComponent={isLoading && notifications.length > 0 ? <ActivityIndicator color={colors.primary} style={styles.loading} /> : undefined}
      ListEmptyComponent={isLoading ? <ActivityIndicator color={colors.primary} style={styles.loading} /> : error ? <View style={styles.empty}><Text style={styles.error}>{error}</Text></View> : <View style={styles.empty}><Text style={styles.emptyTitle}>Chưa có thông báo</Text><Text style={styles.emptyBody}>Thông báo mới sẽ xuất hiện tại đây.</Text></View>}
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
  loading: { marginVertical: 24 },
  error: { color: colors.error, fontFamily: typography.regular, fontSize: 12, marginBottom: 10 },
  empty: { alignItems: 'center', paddingTop: 72, paddingHorizontal: 16 },
  emptyTitle: { color: colors.text, fontFamily: typography.bold, fontSize: 16 },
  emptyBody: { color: colors.textSecondary, fontFamily: typography.regular, fontSize: typography.body, marginTop: 8, textAlign: 'center' },
});
