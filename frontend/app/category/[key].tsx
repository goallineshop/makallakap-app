import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo } from "react";
import { FlatList, StyleSheet, View } from "react-native";

import { EmptyState } from "@/src/components/EmptyState";
import { ProverbListItem } from "@/src/components/ProverbListItem";
import { ScreenHeader } from "@/src/components/ScreenHeader";
import { useTheme } from "@/src/context/ThemeContext";
import { CATEGORY_MAP } from "@/src/data/categories";
import { useI18n } from "@/src/context/LanguageContext";
import { byCategory, Proverb } from "@/src/services/proverbs";

export default function CategoryScreen() {
  const { key } = useLocalSearchParams<{ key: string }>();
  const { colors, spacing } = useTheme();
  const router = useRouter();
  const { t, catLabel } = useI18n();

  const decodedKey = key ? decodeURIComponent(key) : "";
  const meta = CATEGORY_MAP[decodedKey];
  const data = useMemo<Proverb[]>(() => (decodedKey ? byCategory(decodedKey) : []), [decodedKey]);

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <ScreenHeader
        title={meta ? catLabel(decodedKey) : t.categories.title}
        subtitle={t.categories.count(data.length)}
        onBack={() => router.back()}
      />
      {data.length === 0 ? (
        <EmptyState title={t.categories.empty} actionLabel={t.common.back} onAction={() => router.back()} />
      ) : (
        <FlatList
          testID="category-list"
          data={data}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ProverbListItem proverb={item} onPress={() => router.push(`/proverb/${item.id}`)} />
          )}
          showsVerticalScrollIndicator={false}
          initialNumToRender={12}
          maxToRenderPerBatch={16}
          windowSize={9}
          removeClippedSubviews
          contentContainerStyle={{ paddingBottom: spacing["3xl"] }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
