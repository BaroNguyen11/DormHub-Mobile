import { Pressable, StyleSheet } from 'react-native';
import { Text as TamaText, XStack, YStack } from 'tamagui';
import { colors, radius, typography } from '../../theme';
import type { InvoiceDetail } from '../../types/invoice';
import { daysOverdue, formatIsoDate, formatVnd } from '../../utils/invoice';

export function InvoiceStatusBadge({ invoice }: { invoice: InvoiceDetail }) {
  const overdue = daysOverdue(invoice, new Date().toISOString().slice(0, 10)) > 0;
  const paid = invoice.status === 'PAID';
  const label = paid ? 'Đã thanh toán' : invoice.status === 'CANCELLED' ? 'Đã hủy' : overdue ? 'Quá hạn' : 'Chưa thanh toán';
  return <XStack style={[styles.badge, { backgroundColor: paid ? colors.availableBackground : overdue ? colors.invoiceOverdueBadge : invoice.status === 'CANCELLED' ? colors.fullBackground : colors.limitedBackground }]}><TamaText style={[styles.badgeText, { color: paid ? colors.availableText : overdue ? colors.error : invoice.status === 'CANCELLED' ? colors.textSecondary : colors.limitedText }]}>{label}</TamaText></XStack>;
}

export function InvoiceCard({ invoice, onPress }: { invoice: InvoiceDetail; onPress: () => void }) {
  const overdue = daysOverdue(invoice, new Date().toISOString().slice(0, 10));
  const pending = invoice.status === 'UNPAID' && overdue === 0;
  const subtitle = invoice.status === 'PAID' ? `Đã thanh toán ${invoice.paidAt ?? ''}` : invoice.status === 'CANCELLED' ? 'Đã hủy' : overdue > 0 ? `Quá hạn ${overdue} ngày` : `Hạn: ${formatIsoDate(invoice.dueDate)}`;
  return <Pressable accessibilityRole="button" onPress={onPress} style={[styles.card, pending && styles.pendingCard, overdue > 0 && styles.overdueCard]}><XStack style={styles.cardTop}><YStack style={styles.cardCopy}><TamaText style={styles.cardTitle}>{invoice.title}</TamaText><TamaText style={styles.cardSubtitle}>{subtitle}</TamaText></YStack><InvoiceStatusBadge invoice={invoice} /></XStack><TamaText style={styles.amount}>{formatVnd(invoice.totalAmount)}</TamaText></Pressable>;
}

const styles = StyleSheet.create({
  badge: { borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 4, alignItems: 'center', justifyContent: 'center' }, badgeText: { fontFamily: typography.bold, fontSize: 11 },
  card: { backgroundColor: colors.surface, borderWidth: 0.8, borderColor: colors.border, borderRadius: radius.card, padding: 14, minHeight: 96 }, pendingCard: { backgroundColor: colors.invoiceUnpaidCard, borderColor: colors.invoiceUnpaidBorder }, overdueCard: { backgroundColor: colors.invoiceOverdueCard, borderColor: colors.invoiceOverdueBorder }, cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }, cardCopy: { flex: 1 }, cardTitle: { color: colors.text, fontFamily: typography.bold, fontSize: 14 }, cardSubtitle: { color: colors.textSecondary, fontFamily: typography.regular, fontSize: 12, marginTop: 3 }, amount: { color: colors.text, fontFamily: typography.regular, fontSize: 17.5, marginTop: 12 },
});
