import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { AppButton } from '../components/ui/AppButton';
import { ResidenceHeader } from '../components/ui/ResidenceUi';
import { ScreenContainer } from '../components/ui/ScreenContainer';
import { useRepairs } from '../context/RepairContext';
import { useResidence } from '../context/ResidenceContext';
import { repairCategories, repairPriorities } from '../config/repairOptions';
import { colors, radius, typography } from '../theme';
import type { HomeStackParamList } from '../types/navigation';
import type { RepairDraft } from '../types/repair';
import { validateRepairDraft } from '../utils/repair';

export function CreateRepairRequestScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
  const { session } = useResidence();
  const { createRequest } = useRepairs();
  const [draft, setDraft] = useState<RepairDraft>({ category: null, description: '', priority: null, imageUris: [] });
  const [title, setTitle] = useState('');
  const [error, setError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);
  const setField = <K extends keyof RepairDraft>(key: K, value: RepairDraft[K]) => { setDraft((previous) => ({ ...previous, [key]: value })); setError(undefined); };
  const submit = async () => {
    if (submittingRef.current) return;
    if (session.status !== 'active' || !session.roomId) { setError('Bạn cần có phân phòng đang hoạt động để gửi yêu cầu.'); return; }
    if (session.backendRoomId == null) { setError('Chưa có thông tin phòng để gửi yêu cầu.'); return; }
    if (!title.trim()) { setError('Vui lòng nhập tiêu đề yêu cầu.'); return; }
    const issue = validateRepairDraft(draft);
    if (issue) { setError(issue); return; }
    submittingRef.current = true;
    setSubmitting(true);
    try {
      const created = await createRequest(draft, title);
      if (!created) { setError('Không thể tạo yêu cầu trong trạng thái hiện tại.'); return; }
      navigation.replace('RepairRequestDetail', { requestId: created.id });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Không thể gửi yêu cầu. Vui lòng thử lại.');
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  };
  return <ScreenContainer><StatusBar style="dark" /><ResidenceHeader title="Tạo yêu cầu sửa chữa" onBack={() => navigation.goBack()} /><ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
    <View><Text style={styles.label}>Tiêu đề</Text><TextInput value={title} onChangeText={(value) => { setTitle(value); setError(undefined); }} style={styles.description} accessibilityLabel="Tiêu đề yêu cầu" /></View>
    <View><Text style={styles.label}>Danh mục sự cố</Text><View style={styles.categories}>{repairCategories.map((item) => <Pressable key={item.id} onPress={() => setField('category', item.id)} style={[styles.category, draft.category === item.id && styles.selected]}><Text style={[styles.chipText, draft.category === item.id && styles.selectedText]}>{item.symbol ? `${item.symbol} ` : ''}{item.label}</Text></Pressable>)}</View></View>
    <View><Text style={styles.label}>Mô tả chi tiết</Text><TextInput multiline textAlignVertical="top" value={draft.description} onChangeText={(value) => setField('description', value)} style={styles.description} accessibilityLabel="Mô tả chi tiết" /></View>
    <View><Text style={styles.label}>Mức độ ưu tiên</Text><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.priorities}>{repairPriorities.map((item) => <Pressable key={item.id} onPress={() => setField('priority', item.id)} style={[styles.priority, draft.priority === item.id && styles.selected, item.id === 'URGENT' && draft.priority !== item.id && styles.urgent]}><Text style={[styles.chipText, draft.priority === item.id && styles.selectedText, item.id === 'URGENT' && draft.priority !== item.id && styles.urgentText]}>{item.label}</Text></Pressable>)}</ScrollView></View>
    {error ? <Text style={styles.error}>{error}</Text> : null}<AppButton title={submitting ? 'Đang gửi...' : 'Gửi yêu cầu'} onPress={submit} disabled={submitting} />
  </ScrollView></ScreenContainer>;
}
const styles = StyleSheet.create({ content: { padding: 16, gap: 20 }, label: { color: colors.text, fontFamily: typography.bold, fontSize: 13, marginBottom: 8 }, categories: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 8 }, category: { width: '31%', height: 34, backgroundColor: colors.surface, borderWidth: 0.8, borderColor: colors.border, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' }, selected: { backgroundColor: colors.primary, borderColor: colors.primary }, chipText: { color: colors.textSecondary, fontFamily: typography.semibold, fontSize: 12 }, selectedText: { color: colors.surface }, description: { height: 90, backgroundColor: colors.surface, borderWidth: 0.8, borderColor: colors.border, borderRadius: radius.button, padding: 14, color: colors.text, fontFamily: typography.regular, fontSize: 13.5, lineHeight: 18 }, priorities: { flexDirection: 'row', gap: 14 }, priority: { minWidth: 76, paddingHorizontal: 14, height: 34, borderRadius: radius.pill, backgroundColor: colors.surface, borderWidth: 0.8, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' }, urgent: { borderColor: colors.error }, urgentText: { color: colors.error }, images: { flexDirection: 'row', gap: 10 }, addImage: { width: 72, height: 72, borderWidth: 0.8, borderColor: colors.border, borderRadius: radius.button, alignItems: 'center', justifyContent: 'center' }, firstImageTouch: { position: 'absolute', width: 72, height: 72, bottom: 0, left: 0 }, roomId: { color: colors.textSecondary, fontFamily: typography.regular, fontSize: 12 }, hint: { color: colors.textSecondary, fontFamily: typography.regular, fontSize: 12, lineHeight: 18 }, error: { color: colors.error, fontFamily: typography.regular, fontSize: 12 } });
