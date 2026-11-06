import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import type { KeyboardTypeOptions } from 'react-native';
import { Input, Text, XStack, YStack } from 'tamagui';

import { colors, radius, typography } from '../../theme';

interface Props {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  error?: string;
  secure?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoComplete?: 'email' | 'username' | 'name' | 'tel' | 'new-password' | 'current-password' | 'off';
  editable?: boolean;
  helperText?: string;
}

export function FormField({ label, value, onChangeText, placeholder, error, secure = false, keyboardType = 'default', autoCapitalize = 'none', autoComplete = 'off', editable = true, helperText }: Props) {
  const [visible, setVisible] = useState(false);
  return (
    <YStack width="100%">
      <Text color={colors.text} fontFamily="body" fontWeight="700" fontSize={13} marginBottom={6}>{label}</Text>
      <XStack height={46} borderWidth={0.8} borderColor={error ? colors.error : colors.border} borderRadius={radius.button} backgroundColor={colors.surface} alignItems="center">
        <Input
          size={false}
          accessibilityLabel={label}
          autoCapitalize={autoCapitalize}
          autoComplete={autoComplete}
          readOnly={!editable}
          keyboardType={keyboardType as ComponentProps<typeof Input>['keyboardType']}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="placeholder"
          secureTextEntry={secure && !visible}
          flex={1}
          height="100%"
          color={editable ? colors.text : colors.inactiveTab}
          fontFamily="body"
          fontSize={13.5}
          paddingHorizontal={14}
          paddingVertical={0}
          borderWidth={0}
          backgroundColor="transparent"
          value={value}
        />
        {secure && (
          <Pressable accessibilityLabel={visible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'} accessibilityRole="button" onPress={() => setVisible(!visible)} style={styles.eyeButton}>
            <Feather name={visible ? 'eye' : 'eye-off'} size={18} color={colors.placeholder} />
          </Pressable>
        )}
      </XStack>
      {error ? <Text color={colors.error} fontFamily="body" fontWeight="400" fontSize={11.5} marginTop={4}>{error}</Text> : null}
      {helperText ? <Text color={colors.inactiveTab} fontFamily="body" fontWeight="400" fontSize={11.5} marginTop={6}>{helperText}</Text> : null}
    </YStack>
  );
}

const styles = StyleSheet.create({
  eyeButton: { width: 42, height: 46, alignItems: 'center', justifyContent: 'center' },
});
