import { Feather } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import type { CameraCapturedPicture } from 'expo-camera';
import { Image } from 'expo-image';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { useRef, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { AppButton } from '../components/ui/AppButton';
import { ScreenContainer } from '../components/ui/ScreenContainer';
import { colors, typography } from '../theme';
import type { ProfileStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<ProfileStackParamList, 'CCCDCamera'>;

export function CCCDCameraScreen({ navigation, route }: Props) {
  const { side } = route.params;
  const [permission, requestPermission] = useCameraPermissions();
  const [capturedPhoto, setCapturedPhoto] = useState<CameraCapturedPicture | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  const takePicture = async () => {
    if (!cameraRef.current || isCapturing) return;
    setIsCapturing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
      });
      if (photo) {
        setCapturedPhoto(photo);
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể chụp ảnh. Vui lòng thử lại.');
    } finally {
      setIsCapturing(false);
    }
  };

  const retake = () => {
    setCapturedPhoto(null);
  };

  const confirm = () => {
    if (!capturedPhoto) return;
    // In a real implementation, this would pass the photo URI back to the parent screen
    Alert.alert(
      'Ảnh đã chụp',
      `Ảnh CCCD mặt ${side === 'front' ? 'trước' : 'sau'} đã được chụp.\n\nURI: ${capturedPhoto.uri}\n\nLưu ý: Chức năng tải ảnh lên server sẽ được triển khai sau.`,
      [{ text: 'OK', onPress: () => navigation.goBack() }]
    );
  };

  if (!permission) {
    return (
      <ScreenContainer>
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Quay lại"
            onPress={() => navigation.goBack()}
            style={styles.back}
          >
            <Feather name="arrow-left" size={24} color={colors.text} />
          </Pressable>
          <Text style={styles.headerTitle}>Chụp CCCD</Text>
        </View>
        <View style={styles.centerContent}>
          <Text style={styles.message}>Đang kiểm tra quyền camera...</Text>
        </View>
      </ScreenContainer>
    );
  }

  if (!permission.granted) {
    return (
      <ScreenContainer>
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Quay lại"
            onPress={() => navigation.goBack()}
            style={styles.back}
          >
            <Feather name="arrow-left" size={24} color={colors.text} />
          </Pressable>
          <Text style={styles.headerTitle}>Chụp CCCD</Text>
        </View>
        <View style={styles.centerContent}>
          <Feather name="camera-off" size={64} color={colors.inactiveTab} />
          <Text style={styles.permissionTitle}>Cần quyền truy cập camera</Text>
          <Text style={styles.permissionMessage}>
            Ứng dụng cần quyền truy cập camera để chụp ảnh CCCD của bạn.
          </Text>
          <View style={styles.permissionButton}>
            <AppButton title="Cấp quyền" onPress={requestPermission} />
          </View>
        </View>
      </ScreenContainer>
    );
  }

  if (capturedPhoto) {
    return (
      <ScreenContainer>
        <StatusBar style="light" />
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Quay lại"
            onPress={() => navigation.goBack()}
            style={styles.back}
          >
            <Feather name="arrow-left" size={24} color={colors.text} />
          </Pressable>
          <Text style={styles.headerTitle}>Xem lại ảnh</Text>
        </View>
        <View style={styles.previewContainer}>
          <Image source={{ uri: capturedPhoto.uri }} style={styles.preview} contentFit="contain" />
        </View>
        <View style={styles.previewActions}>
          <View style={styles.actionRow}>
            <View style={styles.actionButton}>
              <AppButton title="Chụp lại" onPress={retake} variant="outline" />
            </View>
            <View style={styles.actionButton}>
              <AppButton title="Sử dụng ảnh này" onPress={confirm} />
            </View>
          </View>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <View style={styles.fullScreen}>
      <StatusBar style="light" />
      <CameraView ref={cameraRef} style={styles.camera} facing="back">
        <View style={styles.cameraHeader}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Quay lại"
            onPress={() => navigation.goBack()}
            style={styles.cameraBack}
          >
            <Feather name="arrow-left" size={24} color={colors.surface} />
          </Pressable>
          <Text style={styles.cameraTitle}>
            Chụp mặt {side === 'front' ? 'trước' : 'sau'} CCCD
          </Text>
        </View>

        <View style={styles.cameraGuide}>
          <View style={styles.guideFrame} />
          <Text style={styles.guideText}>
            Đặt CCCD vào trong khung và giữ thật chắc
          </Text>
        </View>

        <View style={styles.cameraControls}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Chụp ảnh"
            onPress={takePicture}
            disabled={isCapturing}
            style={[styles.captureButton, isCapturing && styles.captureButtonDisabled]}
          >
            <View style={styles.captureButtonInner} />
          </Pressable>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  fullScreen: { flex: 1, backgroundColor: colors.background },
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
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  message: {
    color: colors.textSecondary,
    fontFamily: typography.regular,
    fontSize: 14,
    textAlign: 'center',
  },
  permissionTitle: {
    color: colors.text,
    fontFamily: typography.bold,
    fontSize: 18,
    marginTop: 16,
    textAlign: 'center',
  },
  permissionMessage: {
    color: colors.textSecondary,
    fontFamily: typography.regular,
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  permissionButton: { width: '100%', marginTop: 24 },
  camera: { flex: 1 },
  cameraHeader: {
    height: 60,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 12,
  },
  cameraBack: { width: 28, height: 40, justifyContent: 'center' },
  cameraTitle: {
    color: colors.surface,
    fontFamily: typography.bold,
    fontSize: 16,
  },
  cameraGuide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  guideFrame: {
    width: 300,
    height: 190,
    borderWidth: 3,
    borderColor: colors.surface,
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  guideText: {
    color: colors.surface,
    fontFamily: typography.regular,
    fontSize: 14,
    marginTop: 24,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  cameraControls: {
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: colors.surface,
  },
  captureButtonDisabled: { opacity: 0.5 },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: '#333',
  },
  previewContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  preview: {
    width: '100%',
    height: '100%',
  },
  previewActions: {
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 0.8,
    borderTopColor: colors.border,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
});
