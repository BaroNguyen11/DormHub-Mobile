import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet } from 'react-native';
import { Input, Text as TamaText, TextArea, XStack, YStack } from 'tamagui';

import { AppButton } from '../components/ui/AppButton';
import { DetailRow, ResidenceHeader, SectionHeader, SurfaceCard } from '../components/ui/ResidenceUi';
import { ScreenContainer } from '../components/ui/ScreenContainer';
import { cancelRenewalRequest, createRenewalRequest, listContracts, listRenewalRequests } from '../api/student';
import type { ContractDto, RenewalRequestDto } from '../api/student';
import { ApiError } from '../api/httpClient';
import { colors, radius, typography } from '../theme';
import type { ResidenceStackParamList } from '../types/navigation';

export function ContractScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ResidenceStackParamList>>();
  const [contract, setContract] = useState<ContractDto | null>(null);
  const [contracts, setContracts] = useState<readonly ContractDto[]>([]);
  const [renewal, setRenewal] = useState<RenewalRequestDto | null>(null);
  const [renewals, setRenewals] = useState<readonly RenewalRequestDto[]>([]);
  const [requestedDate, setRequestedDate] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const [renewalError, setRenewalError] = useState<string>();

  useFocusEffect(useCallback(() => {
    let active = true;
    setLoading(true); setError(undefined); setRenewalError(undefined);
    Promise.allSettled([listContracts(), listRenewalRequests()]).then(([contractsResult, renewalsResult]) => {
      if (!active) return;
      if (contractsResult.status === 'fulfilled') {
        setContracts(contractsResult.value.data.content);
        const current = contractsResult.value.data.content.filter((item) => ['ACTIVE', 'PENDING'].includes(item.status) || item.assignmentStatus === 'ASSIGNED').sort((a, b) => Number(new Date(b.startDate)) - Number(new Date(a.startDate)))[0] ?? null;
        setContract(current);
        if (current) setRequestedDate(current.endDate.slice(0, 10));
      } else setError(contractsResult.reason instanceof ApiError ? contractsResult.reason.message : 'Không tải được hợp đồng.');
      if (renewalsResult.status === 'fulfilled') {
        setRenewals(renewalsResult.value.data.content);
        const currentRenewal = renewalsResult.value.data.content.find((item) => item.status === 'PENDING') ?? null;
        setRenewal(currentRenewal);
      } else setRenewalError(renewalsResult.reason instanceof ApiError ? renewalsResult.reason.message : 'Không tải được yêu cầu gia hạn.');
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []));

  const submitRenewal = async () => {
    if (!contract || busy) return;
    const datePattern = /^\d{4}-\d{2}-\d{2}$/;
    const [year, month, day] = requestedDate.split('-').map(Number);
    const parsed = new Date(year, month - 1, day);
    const currentEnd = contract.endDate.slice(0, 10);
    if (!datePattern.test(requestedDate) || Number.isNaN(parsed.getTime()) || parsed.getFullYear() !== year || parsed.getMonth() !== month - 1 || parsed.getDate() !== day) {
      setRenewalError('Ngày không hợp lệ. Vui lòng nhập theo định dạng YYYY-MM-DD.'); return;
    }
    if (requestedDate <= currentEnd) { setRenewalError('Ngày kết thúc mới phải sau ngày kết thúc hiện tại.'); return; }
    setBusy(true); setRenewalError(undefined);
    try {
      const result = await createRenewalRequest(contract.contractId, `${requestedDate}T00:00:00`, reason);
      setRenewal(result.data); setReason('');
      setRenewals((previous) => [result.data, ...previous]);
    } catch (cause) {
      setRenewalError(cause instanceof ApiError ? cause.message : 'Không gửi được yêu cầu gia hạn.');
    } finally { setBusy(false); }
  };

  const confirmCancel = () => {
    if (!renewal) return;
    Alert.alert('Hủy yêu cầu gia hạn', 'Bạn có muốn hủy yêu cầu đang chờ duyệt không?', [
      { text: 'Giữ yêu cầu', style: 'cancel' },
      { text: 'Hủy yêu cầu', style: 'destructive', onPress: async () => {
        setBusy(true); setRenewalError(undefined);
        try { const result = await cancelRenewalRequest(renewal.renewalRequestId); setRenewal(null); setRenewals((previous) => previous.map((item) => item.renewalRequestId === renewal.renewalRequestId ? result.data : item)); }
        catch (cause) { setRenewalError(cause instanceof ApiError ? cause.message : 'Không hủy được yêu cầu gia hạn.'); }
        finally { setBusy(false); }
      } },
    ]);
  };

  return <ScreenContainer><StatusBar style="dark" /><ResidenceHeader title="Hợp đồng thuê phòng" onBack={() => navigation.goBack()} />
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
      {loading ? <ActivityIndicator color={colors.primary} /> : error ? <SurfaceCard style={styles.errorCard}><TamaText style={styles.errorText}>{error}</TamaText></SurfaceCard> : !contract ? <SurfaceCard style={styles.emptyCard}><TamaText style={styles.emptyTitle}>Chưa có hợp đồng</TamaText><TamaText style={styles.emptyText}>Hợp đồng sẽ hiển thị sau khi yêu cầu thuê phòng được duyệt.</TamaText></SurfaceCard> : <>
        <SurfaceCard style={styles.numberCard}><YStack style={styles.contractId}><TamaText style={styles.label}>SỐ HỢP ĐỒNG</TamaText><TamaText style={styles.number}>#{contract.contractId}</TamaText></YStack><TamaText style={styles.badge}>{contract.status === 'ACTIVE' ? 'Đang hiệu lực' : contract.status}</TamaText></SurfaceCard>
        <SurfaceCard style={styles.detailsCard}><SectionHeader title="Thông tin thuê phòng" /><DetailRow label="Phòng" value={`${contract.roomNumber} · ${contract.buildingName}`} /><DetailRow label="Ngày bắt đầu" value={new Date(contract.startDate).toLocaleDateString('vi-VN')} /><DetailRow label="Ngày kết thúc" value={new Date(contract.endDate).toLocaleDateString('vi-VN')} /><DetailRow label="Giá phòng / tháng" value={`${Number(contract.monthlyRent).toLocaleString('vi-VN')}đ`} /><DetailRow label="Tiền cọc" value={`${Number(contract.depositAmount).toLocaleString('vi-VN')}đ`} last /></SurfaceCard>
        {contract.description ? <SurfaceCard style={styles.descriptionCard}><SectionHeader title="Điều khoản / mô tả" /><TamaText style={styles.terms}>{contract.description}</TamaText></SurfaceCard> : null}

        <YStack style={styles.renewalHeader}><TamaText style={styles.renewalTitle}>Gia hạn hợp đồng</TamaText><TamaText style={styles.renewalIntro}>Gửi ngày kết thúc mới để ban quản lý xem xét.</TamaText></YStack>
        {renewal ? <SurfaceCard style={styles.renewalCard}><XStack style={styles.pendingRow}><TamaText style={styles.pendingBadge}>ĐANG CHỜ DUYỆT</TamaText><TamaText style={styles.requestedDate}>{new Date(renewal.requestedEndDate).toLocaleDateString('vi-VN')}</TamaText></XStack><TamaText style={styles.terms}>{renewal.reason || 'Không có ghi chú'}</TamaText><AppButton title="Hủy yêu cầu gia hạn" variant="outline" disabled={busy} onPress={confirmCancel} /></SurfaceCard> : contract.status === 'ACTIVE' ? <SurfaceCard style={styles.renewalCard}><TamaText style={styles.inputLabel}>Ngày kết thúc mới (YYYY-MM-DD)</TamaText><Input value={requestedDate} onChangeText={(value) => { setRequestedDate(value); setRenewalError(undefined); }} placeholder="2027-06-30" autoCapitalize="none" style={styles.dateInput} /><TamaText style={styles.inputLabel}>Lý do / ghi chú (không bắt buộc)</TamaText><TextArea size={false} value={reason} onChangeText={setReason} placeholder="Nhập ghi chú cho ban quản lý" maxLength={1000} style={styles.reasonInput} /><AppButton title={busy ? 'Đang gửi…' : 'Gửi yêu cầu gia hạn'} loading={busy} disabled={busy} onPress={() => void submitRenewal()} /></SurfaceCard> : <SurfaceCard style={styles.emptyCard}><TamaText style={styles.emptyText}>Chỉ hợp đồng đang hiệu lực mới có thể gửi yêu cầu gia hạn.</TamaText></SurfaceCard>}
        {renewalError ? <TamaText style={styles.errorText}>{renewalError}</TamaText> : null}
        {renewals.some((item) => item.status !== 'PENDING') ? <YStack style={styles.history}><TamaText style={styles.historyHeading}>Lịch sử gia hạn</TamaText>{renewals.filter((item) => item.status !== 'PENDING').map((item) => <SurfaceCard key={item.renewalRequestId} style={styles.historyCard}><XStack style={styles.pendingRow}><TamaText style={styles.historyStatus}>{item.status === 'APPROVED' ? 'ĐÃ DUYỆT' : item.status === 'REJECTED' ? 'TỪ CHỐI' : 'ĐÃ HỦY'}</TamaText><TamaText style={styles.requestedDate}>{new Date(item.requestedEndDate).toLocaleDateString('vi-VN')}</TamaText></XStack>{item.reviewNote ? <TamaText style={styles.terms}>{item.reviewNote}</TamaText> : null}<TamaText style={styles.historyDate}>Gửi ngày {new Date(item.requestedAt).toLocaleDateString('vi-VN')}</TamaText></SurfaceCard>)}</YStack> : null}
        {contracts.filter((item) => item.contractId !== contract.contractId).length ? <YStack style={styles.history}><TamaText style={styles.historyHeading}>Hợp đồng trước đây</TamaText>{contracts.filter((item) => item.contractId !== contract.contractId).map((item) => <SurfaceCard key={item.contractId} style={styles.historyCard}><XStack style={styles.pendingRow}><TamaText style={styles.historyStatus}>HỢP ĐỒNG #{item.contractId}</TamaText><TamaText style={styles.historyStatus}>{item.status}</TamaText></XStack><TamaText style={styles.terms}>{item.roomNumber} · {item.buildingName}</TamaText><TamaText style={styles.historyDate}>{new Date(item.startDate).toLocaleDateString('vi-VN')} – {new Date(item.endDate).toLocaleDateString('vi-VN')}</TamaText></SurfaceCard>)}</YStack> : null}
      </>}
    </ScrollView>
  </ScreenContainer>;
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 28, gap: 16 }, numberCard: { minHeight: 82, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 18 }, contractId: { gap: 4 }, label: { color: colors.textSecondary, fontFamily: typography.bold, fontSize: 10, letterSpacing: 0.8 }, number: { color: colors.text, fontFamily: typography.bold, fontSize: 20 }, badge: { color: colors.availableText, backgroundColor: colors.availableBackground, overflow: 'hidden', borderRadius: radius.pill, paddingHorizontal: 11, paddingVertical: 7, fontFamily: typography.bold, fontSize: 11 }, detailsCard: { gap: 6 }, descriptionCard: { gap: 12 }, terms: { color: colors.textSecondary, fontFamily: typography.regular, fontSize: 12.5, lineHeight: 20 }, renewalHeader: { gap: 4, paddingTop: 2 }, renewalTitle: { color: colors.text, fontFamily: typography.bold, fontSize: 17 }, renewalIntro: { color: colors.textSecondary, fontFamily: typography.regular, fontSize: 12 }, renewalCard: { gap: 12, padding: 16 }, pendingRow: { alignItems: 'center', justifyContent: 'space-between', gap: 10 }, pendingBadge: { color: colors.warningText, backgroundColor: colors.limitedBackground, borderRadius: radius.pill, paddingHorizontal: 9, paddingVertical: 5, fontFamily: typography.bold, fontSize: 10 }, requestedDate: { color: colors.text, fontFamily: typography.bold, fontSize: 14 }, inputLabel: { color: colors.text, fontFamily: typography.bold, fontSize: 12 }, dateInput: { height: 46, borderWidth: 1, borderColor: colors.border, borderRadius: radius.button, paddingHorizontal: 12, color: colors.text, backgroundColor: colors.surface, fontFamily: typography.regular, fontSize: 13 }, reasonInput: { minHeight: 82, borderWidth: 1, borderColor: colors.border, borderRadius: radius.button, padding: 12, color: colors.text, backgroundColor: colors.surface, fontFamily: typography.regular, fontSize: 13 }, errorCard: { backgroundColor: colors.rejectionBackground, borderColor: colors.rejectionBorder }, errorText: { color: colors.rejectionText, fontFamily: typography.regular, fontSize: 12.5, lineHeight: 19 }, emptyCard: { gap: 8, alignItems: 'center', padding: 20 }, emptyTitle: { color: colors.text, fontFamily: typography.bold, fontSize: 16 }, emptyText: { color: colors.textSecondary, fontFamily: typography.regular, fontSize: 12.5, lineHeight: 19, textAlign: 'center' }, history: { gap: 10 }, historyHeading: { color: colors.text, fontFamily: typography.bold, fontSize: 15 }, historyCard: { gap: 8 }, historyStatus: { color: colors.textSecondary, fontFamily: typography.bold, fontSize: 10 }, historyDate: { color: colors.inactiveTab, fontFamily: typography.regular, fontSize: 11 },
});
