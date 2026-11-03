import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { devPreviewAccounts } from '../../mocks/auth';
import { devPreviewEnabled } from '../../config/devPreview';
import { colors, radius, typography } from '../../theme';
import type { DevPreviewAccountId } from '../../types/auth';

interface Props { accountId: DevPreviewAccountId | null; onSelect: (id: DevPreviewAccountId) => void }
export function DevPreviewMenu({ accountId, onSelect }: Props) {
  const [open, setOpen] = useState(false);
  if (!devPreviewEnabled) return null;
  return (
    <View style={styles.anchor}>
      <Pressable accessibilityRole="button" accessibilityLabel="Đổi tài khoản mock" onPress={() => setOpen(true)} style={styles.trigger}>
        <Text style={styles.triggerText}>DEV: {accountId ?? 'student'} ▾</Text>
      </Pressable>
      <Modal transparent visible={open} animationType="fade" onRequestClose={() => setOpen(false)}>
        <View style={styles.modal}>
          <Pressable style={styles.backdrop} onPress={() => setOpen(false)} accessibilityLabel="Đóng menu Dev" />
          <View style={styles.panel}>
            <Text style={styles.heading}>Tài khoản xem thử</Text>
            {devPreviewAccounts.map((account) => (
              <Pressable
                key={account.id}
                accessibilityRole="button"
                accessibilityState={{ selected: accountId === account.id }}
                onPress={() => { setOpen(false); onSelect(account.id); }}
                style={[styles.option, accountId === account.id && styles.selected]}
              >
                <Text style={[styles.optionText, accountId === account.id && styles.selectedText]}>{account.label}</Text>
              </Pressable>
            ))}
            <Pressable onPress={() => setOpen(false)} style={styles.close}><Text style={styles.closeText}>Đóng</Text></Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}
const styles = StyleSheet.create({ anchor: { position: 'absolute', right: 10, bottom: 68 }, trigger: { backgroundColor: colors.primary, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 7 }, triggerText: { color: colors.surface, fontFamily: typography.semibold, fontSize: 10.5 }, modal: { flex: 1, justifyContent: 'flex-end' }, backdrop: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(0,0,0,0.36)' }, panel: { backgroundColor: colors.surface, borderTopLeftRadius: 18, borderTopRightRadius: 18, padding: 20, gap: 9 }, heading: { color: colors.text, fontFamily: typography.bold, fontSize: 16, marginBottom: 4 }, option: { borderWidth: 0.8, borderColor: colors.border, borderRadius: radius.button, padding: 13 }, selected: { borderColor: colors.primary, backgroundColor: colors.paymentMethodSelected }, optionText: { color: colors.text, fontFamily: typography.regular, fontSize: 13 }, selectedText: { color: colors.primary, fontFamily: typography.bold }, close: { alignItems: 'center', padding: 9 }, closeText: { color: colors.textSecondary, fontFamily: typography.regular, fontSize: 12 } });
