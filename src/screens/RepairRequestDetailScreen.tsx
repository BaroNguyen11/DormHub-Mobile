import { Feather } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { RepairAttachment, RepairStatusBadge, repairCategoryLabel, repairPriorityLabel } from '../components/ui/RepairUi';
import { ResidenceHeader, SurfaceCard } from '../components/ui/ResidenceUi';
import { ScreenContainer } from '../components/ui/ScreenContainer';
import { useRepairs } from '../context/RepairContext';
import { colors, radius, typography } from '../theme';
import type { HomeStackParamList } from '../types/navigation';
import type { RepairRequest } from '../types/repair';

type Props = NativeStackScreenProps<HomeStackParamList, 'RepairRequestDetail'>;
function timeline(request: RepairRequest) {
  const completed = request.status === 'COMPLETED';
  const processing = request.status === 'IN_PROGRESS';
  return [
    { label: 'Đã gửi', detail: `${request.createdDate}${request.createdTime ? ` · ${request.createdTime}` : ''}`, state: 'done' },
    { label: 'Đã tiếp nhận', detail: request.receivedDate ? `${request.receivedDate}${request.receivedTime ? ` · ${request.receivedTime}` : ''}` : '', state: request.status === 'RECEIVED' || processing || completed ? 'done' : 'future' },
    { label: 'Đang xử lý', detail: processing ? request.progressNote ?? '' : '', state: completed ? 'done' : processing ? 'current' : 'future' },
    { label: 'Hoàn thành', detail: '', state: completed ? 'done' : 'future' },
  ] as const;
}
export function RepairRequestDetailScreen({ navigation, route }: Props) {
  const { requests, getRequestDetail } = useRepairs();
  useEffect(() => { void getRequestDetail(route.params.requestId).catch(() => undefined); }, [getRequestDetail, route.params.requestId]);
  const request = requests.find((item) => item.id === route.params.requestId);
  if (!request) return <ScreenContainer><Text style={styles.missing}>Không tìm thấy yêu cầu.</Text></ScreenContainer>;
  return <ScreenContainer><StatusBar style="dark" /><ResidenceHeader title={request.id} onBack={() => navigation.goBack()} /><ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
    <SurfaceCard style={styles.summary}><View style={styles.summaryTop}><Text style={styles.title}>{request.title}</Text><RepairStatusBadge status={request.status} /></View><Text style={styles.meta}>Danh mục: {repairCategoryLabel(request.category)} · Ưu tiên: {repairPriorityLabel(request.priority)}</Text>{request.description ? <Text style={styles.description}>{request.description}</Text> : null}{request.imageUris.length || request.showAttachmentPlaceholder ? <View style={styles.attachments}>{request.imageUris.length ? request.imageUris.map((uri) => <RepairAttachment key={uri} uri={uri} />) : <RepairAttachment />}</View> : null}</SurfaceCard>
    {request.status !== 'CANCELLED' ? <SurfaceCard style={styles.progress}><Text style={styles.progressTitle}>Tiến trình xử lý</Text>{timeline(request).map((step, index) => <View key={step.label} style={styles.step}><View style={styles.stepRail}>{index < 3 ? <View style={[styles.line, step.state === 'done' && styles.doneLine]} /> : null}<View style={[styles.stepIcon, step.state === 'done' ? styles.done : step.state === 'current' ? styles.current : styles.future]}>{step.state === 'done' ? <Feather name="check" size={15} color={colors.surface} /> : step.state === 'current' ? <Feather name="clock" size={15} color={colors.surface} /> : null}</View></View><View style={styles.stepCopy}><Text style={[styles.stepLabel, step.state === 'future' && styles.futureText]}>{step.label}</Text>{step.detail ? <Text style={styles.stepDetail}>{step.detail}</Text> : null}</View></View>)}</SurfaceCard> : null}
  </ScrollView></ScreenContainer>;
}
const styles = StyleSheet.create({ content: { padding: 16, gap: 20 }, summary: { padding: 18 }, summaryTop: { flexDirection: 'row', justifyContent: 'space-between', gap: 8, alignItems: 'flex-start' }, title: { color: colors.text, fontFamily: typography.bold, fontSize: 15, flex: 1 }, meta: { color: colors.textSecondary, fontFamily: typography.regular, fontSize: 12.5, marginTop: 7 }, description: { color: colors.textSecondary, fontFamily: typography.regular, fontSize: 12.5, lineHeight: 20, marginTop: 16 }, attachments: { flexDirection: 'row', gap: 8, marginTop: 14 }, progress: { padding: 18 }, progressTitle: { color: colors.text, fontFamily: typography.bold, fontSize: 15, marginBottom: 14 }, step: { minHeight: 52, flexDirection: 'row', gap: 12 }, stepRail: { width: 22, alignItems: 'center' }, stepIcon: { width: 22, height: 22, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', zIndex: 1 }, done: { backgroundColor: colors.availableText }, current: { backgroundColor: colors.primary }, future: { backgroundColor: colors.fullBackground, borderWidth: 0.8, borderColor: colors.border }, line: { position: 'absolute', top: 18, bottom: -3, width: 2, backgroundColor: colors.border }, doneLine: { backgroundColor: colors.availableText }, stepCopy: { flex: 1 }, stepLabel: { color: colors.text, fontFamily: typography.bold, fontSize: 13.5 }, futureText: { color: colors.inactiveTab }, stepDetail: { color: colors.inactiveTab, fontFamily: typography.regular, fontSize: 12, lineHeight: 17, marginTop: 2 }, missing: { padding: 16, color: colors.text } });
