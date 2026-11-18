import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { TextArea } from 'tamagui';
import { FormField } from '../components/ui/FormField';
import { AppButton } from '../components/ui/AppButton';
import { RepairAttachment } from '../components/ui/RepairUi';
import { ResidenceHeader } from '../components/ui/ResidenceUi';
import { ScreenContainer } from '../components/ui/ScreenContainer';
import { useRepairs } from '../context/RepairContext';
import { useResidence } from '../context/ResidenceContext';
import { repairCategories, repairPriorities } from '../constants/repair';
import { colors, radius, typography } from '../theme';
import type { HomeStackParamList } from '../types/navigation';
import type { RepairDraft } from '../types/repair';
import { validateRepairDraft } from '../utils/repair';
import { ApiError } from '../api/httpClient';

export function CreateRepairRequestScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
  const { session, loading: residenceLoading } = useResidence();
  const { createRequest } = useRepairs();
  const [draft, setDraft] = useState<RepairDraft>({ title: '', description: '', category: 'OTHER', priority: 'MEDIUM', imageUris: [] });
  const [error, setError] = useState<string>();
  const [saving, setSaving] = useState(false);
  const setField = <K extends keyof RepairDraft>(key: K, value: RepairDraft[K]) => { setDraft((previous) => ({ ...previous, [key]: value })); setError(undefined); };
  const pickImage = async () => {
    if (draft.imageUris.length) return;
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: false, quality: 0.85 });
    if (!result.canceled && result.assets[0]) setField('imageUris', [result.assets[0].uri]);
  };
  const submit = async () => {
    if (residenceLoading) return;
    if (session.status !== 'active' || !session.roomId) { setError('Tài khoản chưa có phòng đang ở để tạo yêu cầu sửa chữa.'); return; }
    const issue = validateRepairDraft(draft); if (issue) { setError(issue); return; }
    setSaving(true); setError(undefined);
    try { const created = await createRequest(draft); if (!created) throw new Error('Không thể tạo yêu cầu trong trạng thái hiện tại.'); navigation.replace('RepairRequestDetail', { requestId: created.id }); }
    catch (cause) { setError(cause instanceof ApiError ? cause.message : cause instanceof Error ? cause.message : 'Không thể gửi yêu cầu.'); }
    finally { setSaving(false); }
  };
  return <ScreenContainer><StatusBar style="dark" /><ResidenceHeader title="Tạo yêu cầu sửa chữa" onBack={() => navigation.goBack()} /><ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
    <FormField label="Thiết bị / sự cố" value={draft.title} onChangeText={(value) => setField('title', value)} placeholder="VD: Quạt trần, vòi nước, đèn học" error={undefined} />
    <View><Text style={styles.label}>Loại thiết bị</Text><View style={styles.categories}>{repairCategories.map((item) => <Pressable key={item.id} onPress={() => setField('category', item.id)} style={[styles.category, draft.category === item.id && styles.selected]}><Text style={[styles.chipText, draft.category === item.id && styles.selectedText]}>{item.symbol ? `${item.symbol} ` : ''}{item.label}</Text></Pressable>)}</View></View>
    <View><Text style={styles.label}>Mô tả chi tiết</Text><TextArea size={false} textAlignVertical="top" value={draft.description} onChangeText={(value) => setField('description', value)} placeholder="Mô tả tình trạng và vị trí thiết bị..." style={styles.description} /></View>
    <View><Text style={styles.label}>Mức độ ưu tiên</Text><View style={styles.priorities}>{repairPriorities.map((item) => <Pressable key={item.id} onPress={() => setField('priority', item.id)} style={[styles.priority, draft.priority === item.id && styles.selected]}><Text style={[styles.chipText, draft.priority === item.id && styles.selectedText]}>{item.label}</Text></Pressable>)}</View></View>
    <View><Text style={styles.label}>Ảnh sự cố (không bắt buộc)</Text><View style={styles.images}>{draft.imageUris.map((uri) => <View key={uri} style={styles.imageWrap}><RepairAttachment uri={uri} size={72} /><Pressable style={styles.removeImage} onPress={() => setField('imageUris', [])}><Feather name="x" size={15} color={colors.surface} /></Pressable></View>)}{!draft.imageUris.length ? <Pressable style={styles.addImage} onPress={() => void pickImage()}><Feather name="camera" size={23} color={colors.inactiveTab} /><Text style={styles.imageHint}>Chọn ảnh</Text></Pressable> : null}</View><Text style={styles.helper}>Ảnh sẽ được tải lên máy chủ khi gửi yêu cầu.</Text></View>
    {error ? <Text style={styles.error}>{error}</Text> : null}{residenceLoading ? <ActivityIndicator color={colors.primary} /> : <AppButton title={saving ? 'Đang gửi...' : 'Gửi yêu cầu'} loading={saving} disabled={saving} onPress={() => void submit()} />}
  </ScrollView></ScreenContainer>;
}

const styles = StyleSheet.create({ content: { padding: 16, gap: 20 }, label: { color: colors.text, fontFamily: typography.bold, fontSize: 13, marginBottom: 8 }, categories: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, category: { minWidth: '31%', paddingHorizontal: 8, height: 36, backgroundColor: colors.surface, borderWidth: 0.8, borderColor: colors.border, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' }, selected: { backgroundColor: colors.primary, borderColor: colors.primary }, chipText: { color: colors.textSecondary, fontFamily: typography.semibold, fontSize: 12 }, selectedText: { color: colors.surface }, description: { height: 100, backgroundColor: colors.surface, borderWidth: 0.8, borderColor: colors.border, borderRadius: radius.button, padding: 14, color: colors.text, fontFamily: typography.regular, fontSize: 13.5, lineHeight: 18 }, priorities: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 }, priority: { minWidth: 76, paddingHorizontal: 14, height: 34, borderRadius: radius.pill, backgroundColor: colors.surface, borderWidth: 0.8, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' }, images: { flexDirection: 'row', gap: 10 }, imageWrap: { position: 'relative' }, removeImage: { position: 'absolute', right: -5, top: -5, backgroundColor: colors.error, width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' }, addImage: { width: 72, height: 72, borderWidth: 0.8, borderColor: colors.border, borderRadius: radius.button, alignItems: 'center', justifyContent: 'center', gap: 4 }, imageHint: { color: colors.textSecondary, fontSize: 10 }, helper: { color: colors.textSecondary, fontFamily: typography.regular, fontSize: 11, marginTop: 5 }, error: { color: colors.error, fontFamily: typography.regular, fontSize: 12 } });
