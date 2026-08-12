import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/src/context/ThemeContext';
import { useUserData } from '@/src/context/UserDataContext';
import { Proverb } from '@/src/services/proverbs';

function ProverbListItemBase({
  proverb,
  onPress,
  onFavToggle,
}: {
  proverb: Proverb;
  onPress: () => void;
  onFavToggle?: (nowFav: boolean) => void;
}) {
  const { colors, fonts, type, proverbFont } = useTheme();
  const { isFavorite, toggleFavorite } = useUserData();
  const fav = isFavorite(proverb.id);

  return (
    <Pressable
      testID={`proverb-item-${proverb.id}`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        { borderBottomColor: colors.divider, backgroundColor: pressed ? colors.surfaceSecondary : 'transparent' },
      ]}
    >
      <View style={[styles.marker, { backgroundColor: colors.brandTertiary }]}>
        <Text style={[styles.markerText, { color: colors.onBrandTertiary, fontFamily: fonts.serifBold }]}>
          {proverb.firstLetter}
        </Text>
      </View>
      <View style={styles.textCol}>
        <Text
          style={[styles.proverb, { color: colors.onSurface, fontFamily: proverbFont, fontSize: type(18) }]}
          numberOfLines={2}
        >
          {proverb.proverb}
        </Text>
        {proverb.meaning ? (
          <Text
            style={[styles.meaning, { color: colors.onSurfaceSecondary, fontFamily: fonts.sans, fontSize: type(13) }]}
            numberOfLines={1}
          >
            {proverb.meaning}
          </Text>
        ) : null}
      </View>
      <Pressable
        testID={`fav-toggle-${proverb.id}`}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          const now = toggleFavorite(proverb.id);
          onFavToggle?.(now);
        }}
        hitSlop={10}
        style={styles.favBtn}
      >
        <Feather name="heart" size={20} color={fav ? colors.brandPrimary : colors.onSurfaceTertiary} />
      </Pressable>
    </Pressable>
  );
}

export const ProverbListItem = React.memo(ProverbListItemBase);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  marker: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerText: { fontSize: 20 },
  textCol: { flex: 1 },
  proverb: { lineHeight: 24 },
  meaning: { marginTop: 3, lineHeight: 18 },
  favBtn: { padding: 6 },
});
