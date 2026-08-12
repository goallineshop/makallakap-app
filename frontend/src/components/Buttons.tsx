import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/src/context/ThemeContext';

export function PrimaryButton({
  label,
  icon,
  onPress,
  testID,
  variant = 'primary',
  loading,
  fullWidth,
}: {
  label: string;
  icon?: string;
  onPress: () => void;
  testID?: string;
  variant?: 'primary' | 'secondary' | 'outline';
  loading?: boolean;
  fullWidth?: boolean;
}) {
  const { colors, fonts } = useTheme();

  const bg =
    variant === 'primary'
      ? colors.brandPrimary
      : variant === 'secondary'
        ? colors.surfaceSecondary
        : 'transparent';
  const fg =
    variant === 'primary'
      ? colors.onBrandPrimary
      : variant === 'outline'
        ? colors.brandPrimary
        : colors.onSurface;
  const border = variant === 'outline' ? colors.brandPrimary : 'transparent';

  return (
    <Pressable
      testID={testID}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      style={({ pressed }) => [
        styles.btn,
        {
          backgroundColor: bg,
          borderColor: border,
          borderWidth: variant === 'outline' ? 1.5 : 0,
          opacity: pressed ? 0.85 : 1,
          alignSelf: fullWidth ? 'stretch' : 'auto',
        },
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <View style={styles.content}>
          {icon ? <Feather name={icon as any} size={18} color={fg} /> : null}
          <Text style={[styles.label, { color: fg, fontFamily: fonts.sansSemi }]}>{label}</Text>
        </View>
      )}
    </Pressable>
  );
}

export function IconCircleButton({
  icon,
  onPress,
  testID,
  active,
  size = 42,
}: {
  icon: string;
  onPress: () => void;
  testID?: string;
  active?: boolean;
  size?: number;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      hitSlop={8}
      style={({ pressed }) => [
        styles.circle,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: active ? colors.brandPrimary : colors.surfaceSecondary,
          opacity: pressed ? 0.7 : 1,
        },
      ]}
    >
      <Feather
        name={icon as any}
        size={size * 0.45}
        color={active ? colors.onBrandPrimary : colors.onSurface}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    height: 52,
    borderRadius: 999,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  label: { fontSize: 15 },
  circle: { alignItems: 'center', justifyContent: 'center' },
});
