import { useRef, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import {
  AuthPocError,
  getConfiguredApiBaseUrl,
  getCsrf,
  getMe,
  login,
  logout,
  refresh,
} from '../../api/authPoc';
import type { AuthUser, PocResult } from '../../api/authPoc';
import { useAuth } from '../../context/AuthContext';

type Action = 'Lấy CSRF' | 'Login' | 'Get Me' | 'Refresh' | 'Logout';

export function AuthPocPanel() {
  const { recheckSession } = useAuth();
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const [result, setResult] = useState('Chưa thực hiện request.');

  if (!__DEV__) return null;

  async function run(action: Action) {
    if (busyRef.current) return;
    if (action === 'Login' && (!email.trim() || !password)) {
      setResult('Login: cần nhập email và password.');
      return;
    }
    busyRef.current = true;
    setBusy(true);
    setResult(`${action}: đang gửi request...`);
    try {
      let response: PocResult<AuthUser | null>;
      switch (action) {
        case 'Lấy CSRF': response = await getCsrf(); break;
        case 'Login': response = await login(email, password); setPassword(''); break;
        case 'Get Me': response = await getMe(); break;
        case 'Refresh': response = await refresh(); break;
        case 'Logout': response = await logout(); setPassword(''); break;
      }
      if (action === 'Login' || action === 'Refresh' || action === 'Logout') await recheckSession();
      const user = response.data && 'userId' in response.data
        ? `\nUser ID: ${response.data.userId}\nRole: ${response.data.role}\nStatus: ${response.data.status}`
        : '';
      const csrf = response.csrfReady === undefined ? '' : `\nCSRF: ${response.csrfReady ? 'sẵn sàng' : 'chưa lấy lại được; bấm Lấy CSRF'}`;
      setResult(`${action}: HTTP ${response.httpStatus}${user}${csrf}`);
    } catch (error) {
      const failure = error instanceof AuthPocError ? error : new AuthPocError('Lỗi không xác định.');
      const status = failure.httpStatus === null ? '' : `HTTP ${failure.httpStatus} · `;
      const code = failure.code ? `${failure.code} · ` : '';
      setResult(`${action}: ${status}${code}${failure.message}`);
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }

  return (
    <View style={styles.anchor}>
      <Pressable accessibilityRole="button" accessibilityLabel="Mở Auth PoC" onPress={() => setVisible(true)} style={styles.trigger}>
        <Text style={styles.triggerText}>DEV Auth PoC</Text>
      </Pressable>
      <Modal visible={visible} animationType="slide" onRequestClose={() => { setPassword(''); setVisible(false); }}>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.panel}>
          <View style={styles.header}>
            <Text style={styles.title}>Cookie Authentication PoC</Text>
            <Pressable accessibilityRole="button" onPress={() => { setPassword(''); setVisible(false); }}>
              <Text style={styles.close}>Đóng</Text>
            </Pressable>
          </View>
          <Text style={styles.caption}>Chỉ hoạt động trong DEV. Cookie dùng chung với phiên thật; Login và Logout tại đây sẽ cập nhật điều hướng.</Text>
          <Text style={styles.url}>API: {getConfiguredApiBaseUrl() ?? 'Chưa cấu hình EXPO_PUBLIC_API_BASE_URL'}</Text>
          <TextInput
            accessibilityLabel="Email thử nghiệm"
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            placeholder="Email thử nghiệm"
            style={styles.input}
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            accessibilityLabel="Password thử nghiệm"
            autoComplete="current-password"
            placeholder="Password"
            secureTextEntry
            style={styles.input}
            value={password}
            onChangeText={setPassword}
          />
          <View style={styles.actions}>
            {(['Lấy CSRF', 'Login', 'Get Me', 'Refresh', 'Logout'] as const).map((action) => (
              <Pressable
                key={action}
                accessibilityRole="button"
                accessibilityState={{ disabled: busy }}
                disabled={busy}
                onPress={() => void run(action)}
                style={[styles.button, busy && styles.disabled]}
              >
                <Text style={styles.buttonText}>{action}</Text>
              </Pressable>
            ))}
          </View>
          <Text accessibilityRole="summary" style={styles.result}>{result}</Text>
        </ScrollView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  anchor: { position: 'absolute', left: 12, bottom: 72 },
  trigger: { backgroundColor: '#283B5B', paddingHorizontal: 12, paddingVertical: 9, borderRadius: 18 },
  triggerText: { color: '#FFFFFF', fontWeight: '700', fontSize: 12 },
  panel: { flexGrow: 1, paddingTop: 52, paddingHorizontal: 20, paddingBottom: 36, gap: 16, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  title: { color: '#17243C', fontSize: 19, fontWeight: '700', flexShrink: 1 },
  close: { color: '#195FAD', fontSize: 15, fontWeight: '600' },
  caption: { color: '#53627B', fontSize: 13, lineHeight: 19 },
  url: { color: '#344561', fontSize: 12 },
  input: { borderColor: '#C7D0DD', borderWidth: 1, borderRadius: 9, padding: 12, fontSize: 15 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  button: { backgroundColor: '#195FAD', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 11 },
  disabled: { opacity: 0.5 },
  buttonText: { color: '#FFFFFF', fontWeight: '600', fontSize: 13 },
  result: { color: '#17243C', backgroundColor: '#EFF3F8', borderRadius: 9, padding: 14, minHeight: 90, lineHeight: 21 },
});
