import { Feather } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppButton } from '../components/ui/AppButton';
import { FormField } from '../components/ui/FormField';
import { ScreenContainer } from '../components/ui/ScreenContainer';
import { useMockAccount } from '../context/MockAccountContext';
import { colors, radius, typography } from '../theme';
import type { ProfileStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<ProfileStackParamList, 'CCCDInput'>;

export function CCCDInputScreen({ navigation }: Props) {
  const { profile, saveStudentProfile, refreshProfile } = useMockAccount();
  const [cicNumber, setCicNumber] = useState('');
  const [error, setError] = useState<string>();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile?.cic) {
      setCicNumber(profile.cic);
    }
  }, [profile]);

  const validateCIC = (value: string): boolean => {
    if (!value.trim()) {
      setError('Vui lòng nhập số CCCD');
      return false;
    }
    if (!/^\d{12}$/.test(value.trim())) {
      setError('Số CCCD phải là 12 chữ số');
      return false;
    }
    setError(undefined);
    return true;
  };

  const handleCICChange = (value: string) => {
    // Only allow digits
    const digits = value.replace(/\D/g, '');
    setCicNumber(digits);
    if (error) {
      setError(undefined);
    }
  };

  const handleSave = async () => {
    if (saving || !validateCIC(cicNumber)) return;
    setSaving(true);
    try {
      const value = cicNumber.trim();
      await saveStudentProfile({ cic: value });
      const latest = await refreshProfile();
      if (latest?.cic !== value) throw new Error('Chưa thể xác nhận số CCCD đã lưu. Vui lòng thử lại.');
      Alert.alert('Đã lưu số CCCD', 'Số CCCD của bạn đã được cập nhật.', [
        { text: 'Đóng', onPress: () => navigation.goBack() },
      ]);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Không thể lưu số CCCD. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  const openCamera = (side: 'front' | 'back') => {
    navigation.navigate('CCCDCamera', { side });
  };

  const openDocumentPicker = () => {
    navigation.navigate('DocumentPicker');
  };

  return (
    <ScreenContainer>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Quay lại"
          onPress={() => navigation.goBack()}
          style={styles.back}
        >
          <Feather name="arrow-left" size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Xác minh CCCD</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.infoCard}>
          <Feather name="info" size={20} color={colors.primary} />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Xác minh danh tính</Text>
            <Text style={styles.infoText}>
              Nhập số CCCD 12 chữ số để cập nhật hồ sơ. Bạn có thể chụp hoặc chọn ảnh để xem thử trên thiết bị.
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Số CCCD</Text>
          <FormField
            label="Số căn cước công dân"
            value={cicNumber}
            onChangeText={handleCICChange}
            placeholder="Nhập 12 chữ số"
            keyboardType="number-pad"
            error={error}
            helperText="Số CCCD gồm 12 chữ số"
          />
          {profile?.cic && (
            <View style={styles.currentInfo}>
              <Feather name="check-circle" size={16} color={colors.success} />
              <Text style={styles.currentText}>
                Số CCCD hiện tại: ********{profile.cic.slice(-4)}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ảnh CCCD</Text>
          <Text style={styles.sectionDescription}>
            Ảnh chỉ được xem trên thiết bị và không bắt buộc khi đăng ký phòng.
          </Text>

          <View style={styles.photoActions}>
            <Pressable
              accessibilityRole="button"
              onPress={() => openCamera('front')}
              style={styles.photoCard}
            >
              <View style={styles.photoIconContainer}>
                <Feather name="camera" size={32} color={colors.primary} />
              </View>
              <Text style={styles.photoCardTitle}>Chụp mặt trước</Text>
              <Text style={styles.photoCardDescription}>
                Sử dụng camera để chụp mặt trước CCCD
              </Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              onPress={() => openCamera('back')}
              style={styles.photoCard}
            >
              <View style={styles.photoIconContainer}>
                <Feather name="camera" size={32} color={colors.primary} />
              </View>
              <Text style={styles.photoCardTitle}>Chụp mặt sau</Text>
              <Text style={styles.photoCardDescription}>
                Sử dụng camera để chụp mặt sau CCCD
              </Text>
            </Pressable>
          </View>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>HOẶC</Text>
            <View style={styles.dividerLine} />
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={openDocumentPicker}
            style={styles.filePickerCard}
          >
            <Feather name="folder" size={24} color={colors.primary} />
            <View style={styles.filePickerContent}>
              <Text style={styles.filePickerTitle}>Chọn file từ thiết bị</Text>
              <Text style={styles.filePickerDescription}>
                Chọn file ảnh hoặc PDF có sẵn trong thiết bị
              </Text>
            </View>
            <Feather name="chevron-right" size={20} color={colors.inactiveTab} />
          </Pressable>
        </View>

        <View style={styles.warningCard}>
          <Feather name="alert-circle" size={20} color={colors.warning} />
          <Text style={styles.warningText}>
            Ảnh chụp và tài liệu được chọn không được gửi lên hệ thống.
          </Text>
        </View>

        <View style={styles.actions}>
          <AppButton
            title={saving ? 'Đang lưu...' : 'Lưu số CCCD'}
            onPress={() => void handleSave()}
            disabled={saving || !cicNumber.trim()}
          />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 52,
    backgroundColor: colors.surface,
    borderBottomWidth: 0.8,
    borderBottomColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 12,
  },
  back: { width: 28, height: 40, justifyContent: 'center' },
  headerTitle: { color: colors.text, fontFamily: typography.bold, fontSize: 18 },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  infoCard: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    padding: 14,
    borderWidth: 0.8,
    borderColor: colors.primary,
    marginBottom: 24,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    color: colors.text,
    fontFamily: typography.bold,
    fontSize: 14,
    marginBottom: 4,
  },
  infoText: {
    color: colors.text,
    fontFamily: typography.regular,
    fontSize: 13,
    lineHeight: 18,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: colors.text,
    fontFamily: typography.bold,
    fontSize: 16,
    marginBottom: 12,
  },
  sectionDescription: {
    color: colors.textSecondary,
    fontFamily: typography.regular,
    fontSize: 13,
    marginBottom: 16,
    lineHeight: 18,
  },
  currentInfo: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: colors.surface,
    borderRadius: radius.button,
  },
  currentText: {
    color: colors.text,
    fontFamily: typography.regular,
    fontSize: 13,
  },
  photoActions: {
    flexDirection: 'row',
    gap: 12,
  },
  photoCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    padding: 16,
    alignItems: 'center',
    borderWidth: 0.8,
    borderColor: colors.border,
  },
  photoIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  photoCardTitle: {
    color: colors.text,
    fontFamily: typography.bold,
    fontSize: 14,
    marginBottom: 4,
    textAlign: 'center',
  },
  photoCardDescription: {
    color: colors.textSecondary,
    fontFamily: typography.regular,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 0.8,
    backgroundColor: colors.border,
  },
  dividerText: {
    color: colors.textSecondary,
    fontFamily: typography.regular,
    fontSize: 12,
    marginHorizontal: 12,
  },
  filePickerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    padding: 16,
    borderWidth: 0.8,
    borderColor: colors.border,
  },
  filePickerContent: {
    flex: 1,
  },
  filePickerTitle: {
    color: colors.text,
    fontFamily: typography.bold,
    fontSize: 14,
    marginBottom: 2,
  },
  filePickerDescription: {
    color: colors.textSecondary,
    fontFamily: typography.regular,
    fontSize: 12,
    lineHeight: 16,
  },
  warningCard: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    padding: 14,
    borderWidth: 0.8,
    borderColor: colors.warning,
    marginBottom: 20,
  },
  warningText: {
    flex: 1,
    color: colors.text,
    fontFamily: typography.regular,
    fontSize: 12,
    lineHeight: 17,
  },
  actions: {
    marginTop: 4,
  },
});
