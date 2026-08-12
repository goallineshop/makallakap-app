import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { EmptyState } from "@/src/components/EmptyState";
import { ProverbListItem } from "@/src/components/ProverbListItem";
import { useTheme } from "@/src/context/ThemeContext";
import { useUserData } from "@/src/context/UserDataContext";
import { useI18n } from "@/src/context/LanguageContext";
import { getById, Proverb } from "@/src/services/proverbs";

export default function FavoritesScreen() {
  const { colors, fonts, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { favorites } = useUserData();
  const { t } = useI18n();

  const data = useMemo(
    () => favorites.map((id) => getById(id)).filter(Boolean) as Proverb[],
    [favorites],
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <View
        style={[
          styles.header,
          { paddingTop: insets.top + 8, backgroundColor: colors.surface, borderBottomColor: colors.divider },
        ]}
      >
        <Text style={[styles.title, { color: colors.onSurface, fontFamily: fonts.serifBold }]}>
          {t.favorites.title}
        </Text>
        {data.length > 0 ? (
          <Text style={[styles.count, { color: colors.onSurfaceSecondary, fontFamily: fonts.sansMed }]}>
            {t.favorites.count(data.length)}
          </Text>
        ) : null}
      </View>

      {data.length === 0 ? (
        <EmptyState
          title={t.favorites.empty}
          hint={t.favorites.emptyHint}
          actionLabel={t.browse.title}
          onAction={() => router.push("/(tabs)/browse")}
        />
      ) : (
        <FlatList
          testID="favorites-list"
          data={data}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ProverbListItem proverb={item} onPress={() => router.push(`/proverb/${item.id}`)} />
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: spacing["3xl"] }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  title: { fontSize: 26 },
  count: { fontSize: 12, marginTop: 4 },
});
