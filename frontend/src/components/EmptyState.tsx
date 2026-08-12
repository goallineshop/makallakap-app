import { Image } from 'expo-image';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/src/context/ThemeContext';

const BOOK_LIGHT =
  'https://images.unsplash.com/photo-1521999888901-8ae925873659?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxODF8MHwxfHNlYXJjaHwyfHxvcGVuJTIwdmludGFnZSUyMGJvb2slMjBmbGF0JTIwbGF5JTIwb24lMjB3b29kZW4lMjB0YWJsZXxlbnwwfHx8fDE3ODY1NTkzNDV8MA&ixlib=rb-4.1.0&q=85';
const BOOK_DARK =
  'https://images.unsplash.com/photo-1502051400-dad986bddd4f?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxODF8MHwxfHNlYXJjaHwyfHxvcGVuJTIwdmludGFnZSUyMGJvb2slMjBmbGF0JTIwbGF5JTIwb24lMjB3b29kZW4lMjB0YWJsZXxlbnwwfHx8fDE3ODY1NTkzNDV8MA&ixlib=rb-4.1.0&q=85';

export function EmptyState({
  title,
  hint,
  actionLabel,
  onAction,
}: {
  title: string;
  hint?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  const { colors, fonts, isDark } = useTheme();
  return (
    <View style={styles.wrap} testID="empty-state">
      <Image
        source={{ uri: isDark ? BOOK_DARK : BOOK_LIGHT }}
        style={[styles.image, { borderColor: colors.border }]}
        contentFit="cover"
        transition={300}
      />
      <Text style={[styles.title, { color: colors.onSurface, fontFamily: fonts.serifSemi }]}>
        {title}
      </Text>
      {hint ? (
        <Text style={[styles.hint, { color: colors.onSurfaceSecondary, fontFamily: fonts.sans }]}>
          {hint}
        </Text>
      ) : null}
      {actionLabel && onAction ? (
        <Pressable
          testID="empty-state-action"
          onPress={onAction}
          style={({ pressed }) => [
            styles.btn,
            { backgroundColor: colors.brandPrimary, opacity: pressed ? 0.85 : 1 },
          ]}
        >
          <Text style={[styles.btnText, { color: colors.onBrandPrimary, fontFamily: fonts.sansSemi }]}>
            {actionLabel}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, paddingVertical: 40 },
  image: { width: 140, height: 140, borderRadius: 20, marginBottom: 24, borderWidth: 1 },
  title: { fontSize: 24, textAlign: 'center' },
  hint: { fontSize: 14, textAlign: 'center', marginTop: 8, lineHeight: 20 },
  btn: { marginTop: 20, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 999 },
  btnText: { fontSize: 14 },
});
