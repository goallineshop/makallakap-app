import { Feather } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/src/context/ThemeContext';

export function SectionHeader({
  title,
  icon,
  actionLabel,
  onAction,
}: {
  title: string;
  icon?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  const { colors, fonts } = useTheme();
  return (
    <View style={styles.row}>
      <View style={styles.left}>
        {icon ? <Feather name={icon as any} size={18} color={colors.brandPrimary} /> : null}
        <Text style={[styles.title, { color: colors.onSurface, fontFamily: fonts.serifBold }]}>
          {title}
        </Text>
      </View>
      {actionLabel && onAction ? (
        <Pressable
          testID={`section-action-${title}`}
          onPress={onAction}
          hitSlop={8}
          style={({ pressed }) => [styles.action, { opacity: pressed ? 0.5 : 1 }]}
        >
          <Text style={[styles.actionText, { color: colors.brandPrimary, fontFamily: fonts.sansSemi }]}>
            {actionLabel}
          </Text>
          <Feather name="chevron-right" size={16} color={colors.brandPrimary} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { fontSize: 22, letterSpacing: 0.2 },
  action: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  actionText: { fontSize: 13 },
});
