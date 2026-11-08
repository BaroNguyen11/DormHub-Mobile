import { Feather } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import type { DocumentPickerAsset } from 'expo-document-picker';
import { Image } from 'expo-image';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppButton } from '../components/ui/AppButton';
import { ScreenContainer } from '../components/ui/ScreenContainer';
import { colors, radius, typography } from '../theme';
import type { ProfileStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<ProfileStackParamList, 'DocumentPicker'>;

export function DocumentPickerScreen({ navigation }: Props) {
  const [selectedDocument, setSelectedDocument] = useState<DocumentPickerAsset | null>(null);
  const [isPicking, setIsPicking] = useState(false);

  const pickDocument = async () => {
    if (isPicking) return;
    setIsPicking(true);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'application/pdf'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedDocument(result.assets[0]);
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể chọn tài liệu. Vui lòng thử lại.');
    } finally {
      setIsPicking(false);
    }
  };

  const clearDocument = () => {
    setSelectedDocument(null);
  };

  const confirmDocument = () => {
    if (!selectedDocument) return;
    Alert.alert(
      'Tài liệu đã chọn',
      `Tên file: ${selectedDocument.name}\nKích thước: ${formatFileSize(selectedDocument.size ?? 0)}\nLoại: ${selectedDocument.mimeType ?? 'Không xác định'}\n\nURI: ${selectedDocument.uri}\n\nLưu ý: Chức năng tải tài liệu lên server sẽ được triển khai sau.`,
      [{ text: 'OK', onPress: () => navigation.goBack() }]
    );
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const isImage = selectedDocument?.mimeType?.startsWith('image/');

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
        <Text style={styles.headerTitle}>Chọn tài liệu CCCD</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.infoCard}>
          <Feather name="info" size={20} color={colors.primary} />
          <Text style={styles.infoText}>
            Bạn có thể chọn file ảnh (JPEG, PNG) hoặc file PDF chứa ảnh CCCD của bạn.
          </Text>
        </View>

        {!selectedDocument ? (
          <View style={styles.emptyState}>
            <View style={styles.iconCircle}>
              <Feather name="file-text" size={48} color={colors.inactiveTab} />
            </View>
            <Text style={styles.emptyTitle}>Chưa chọn tài liệu</Text>
            <Text style={styles.emptyMessage}>
              Nhấn nút bên dưới để chọn file ảnh hoặc PDF từ thiết bị của bạn.
            </Text>
          </View>
        ) : (
          <View style={styles.documentCard}>
            <Text style={styles.sectionTitle}>Tài liệu đã chọn</Text>
            
            {isImage && selectedDocument.uri && (
              <View style={styles.imagePreview}>
                <Image
                  source={{ uri: selectedDocument.uri }}
                  style={styles.previewImage}
                  contentFit="contain"
                />
              </View>
            )}

            <View style={styles.documentInfo}>
              <View style={styles.infoRow}>
                <Feather name="file" size={20} color={colors.text} />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Tên file</Text>
                  <Text style={styles.infoValue} numberOfLines={2}>
                    {selectedDocument.name}
                  </Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <Feather name="hard-drive" size={20} color={colors.text} />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Kích thước</Text>
                  <Text style={styles.infoValue}>
                    {formatFileSize(selectedDocument.size ?? 0)}
                  </Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <Feather name="type" size={20} color={colors.text} />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Loại file</Text>
                  <Text style={styles.infoValue}>
                    {selectedDocument.mimeType ?? 'Không xác định'}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.documentActions}>
              <View style={styles.actionButton}>
                <AppButton
                  title="Chọn file khác"
                  onPress={pickDocument}
                  variant="outline"
                  disabled={isPicking}
                />
              </View>
              <View style={styles.actionButton}>
                <AppButton
                  title="Xóa"
                  onPress={clearDocument}
                  variant="outline"
                />
              </View>
            </View>
          </View>
        )}

        <View style={styles.actions}>
          {!selectedDocument ? (
            <AppButton
              title={isPicking ? 'Đang chọn...' : 'Chọn tài liệu'}
              onPress={pickDocument}
              disabled={isPicking}
            />
          ) : (
            <AppButton
              title="Sử dụng tài liệu này"
              onPress={confirmDocument}
            />
          )}
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
    marginBottom: 20,
  },
  infoText: {
    flex: 1,
    color: colors.text,
    fontFamily: typography.regular,
    fontSize: 13,
    lineHeight: 18,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 24,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    color: colors.text,
    fontFamily: typography.bold,
    fontSize: 18,
    marginBottom: 8,
  },
  emptyMessage: {
    color: colors.textSecondary,
    fontFamily: typography.regular,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  documentCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    padding: 16,
    gap: 16,
  },
  sectionTitle: {
    color: colors.text,
    fontFamily: typography.bold,
    fontSize: 16,
  },
  imagePreview: {
    width: '100%',
    height: 200,
    backgroundColor: colors.background,
    borderRadius: radius.button,
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  documentInfo: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    color: colors.textSecondary,
    fontFamily: typography.regular,
    fontSize: 12,
    marginBottom: 2,
  },
  infoValue: {
    color: colors.text,
    fontFamily: typography.regular,
    fontSize: 14,
    lineHeight: 18,
  },
  documentActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
  },
  actions: {
    marginTop: 20,
  },
});
