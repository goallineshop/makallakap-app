import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/src/context/ThemeContext';
import { Proverb } from '@/src/services/proverbs';

export function ProverbMiniCard({ proverb, onPress }: { proverb: Proverb; onPress: () => void }) {
  const { colors, fonts, proverbFont, type } = useTheme();
  return (
    <Pressable
      testID={`mini-card-${proverb.id}`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.surfaceSecondary,
          borderColor: colors.border,
          opacity: pressed ? 0.85 : 1,
        },
      ]}
    >
      <View style={[styles.quote, { backgroundColor: colors.brandTertiary }]}>
        <Text style={[styles.quoteMark, { color: colors.onBrandTertiary, fontFamily: fonts.serifBold }]}>
          “
        </Text>
      </View>
      <Text
        style={[styles.proverb, { color: colors.onSurface, fontFamily: proverbFont, fontSize: type(18) }]}
        numberOfLines={3}
      >
        {proverb.proverb}
      </Text>
      {proverb.meaning ? (
        <Text
          style={[styles.meaning, { color: colors.onSurfaceSecondary, fontFamily: fonts.sans, fontSize: type(12) }]}
          numberOfLines={2}
        >
          {proverb.meaning}
        </Text>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 240,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    justifyContent: 'flex-start',
    minHeight: 150,
  },
  quote: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  quoteMark: { fontSize: 26, marginTop: 10 },
  proverb: { lineHeight: 24 },
  meaning: { marginTop: 8, lineHeight: 17 },
});
