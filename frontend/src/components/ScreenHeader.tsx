import { Feather } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/src/context/ThemeContext';

export function ScreenHeader({
  title,
  subtitle,
  onBack,
  right,
}: {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  right?: React.ReactNode;
}) {
  const { colors, fonts, spacing } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.wrap,
        {
          paddingTop: insets.top + spacing.sm,
          backgroundColor: colors.surface,
          borderBottomColor: colors.divider,
        },
      ]}
    >
      <View style={styles.row}>
        <View style={styles.side}>
          {onBack && (
            <Pressable
              testID="header-back-button"
              onPress={onBack}
              hitSlop={12}
              style={({ pressed }) => [
                styles.iconBtn,
                { backgroundColor: colors.surfaceSecondary, opacity: pressed ? 0.6 : 1 },
              ]}
            >
              <Feather name="chevron-left" size={22} color={colors.onSurface} />
            </Pressable>
          )}
        </View>
        <View style={styles.center}>
          <Text
            style={[styles.title, { color: colors.onSurface, fontFamily: fonts.serifBold }]}
            numberOfLines={1}
          >
            {title}
          </Text>
          {subtitle ? (
            <Text
              style={[styles.subtitle, { color: colors.onSurfaceSecondary, fontFamily: fonts.sans }]}
              numberOfLines={1}
            >
              {subtitle}
            </Text>
          ) : null}
        </View>
        <View style={[styles.side, styles.rightSide]}>{right}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  row: { flexDirection: 'row', alignItems: 'center', minHeight: 40 },
  side: { width: 44, justifyContent: 'center' },
  rightSide: { alignItems: 'flex-end' },
  center: { flex: 1, alignItems: 'center' },
  title: { fontSize: 24, letterSpacing: 0.3 },
  subtitle: { fontSize: 12, marginTop: 1 },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
