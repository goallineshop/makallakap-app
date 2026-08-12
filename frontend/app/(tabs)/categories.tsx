import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CategoryIcon } from "@/src/components/CategoryIcon";
import { useTheme } from "@/src/context/ThemeContext";
import { CATEGORIES } from "@/src/data/categories";
import { useI18n } from "@/src/context/LanguageContext";
import { categoryCount } from "@/src/services/proverbs";

export default function CategoriesScreen() {
  const { colors, fonts, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t, catLabel } = useI18n();

  const counts = useMemo(() => {
    const m: Record<string, number> = {};
    for (const c of CATEGORIES) m[c.key] = categoryCount(c.key);
    return m;
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <View
        style={[
          styles.header,
          { paddingTop: insets.top + 8, backgroundColor: colors.surface, borderBottomColor: colors.divider },
        ]}
      >
        <Text style={[styles.title, { color: colors.onSurface, fontFamily: fonts.serifBold }]}>
          {t.categories.title}
        </Text>
        <Text style={[styles.subtitle, { color: colors.onSurfaceSecondary, fontFamily: fonts.sans }]}>
          {t.categories.subtitle}
        </Text>
      </View>

      <ScrollView
        testID="categories-scroll"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing["3xl"] }}
      >
        <View style={styles.grid}>
          {CATEGORIES.map((c) => (
            <Pressable
              key={c.key}
              testID={`category-card-${c.key}`}
              onPress={() => router.push(`/category/${encodeURIComponent(c.key)}`)}
              style={({ pressed }) => [
                styles.card,
                { backgroundColor: colors.brandTertiary, opacity: pressed ? 0.8 : 1 },
              ]}
            >
              <View style={[styles.iconWrap, { backgroundColor: colors.surface }]}>
                <CategoryIcon icon={c.icon} lib={c.lib} size={22} color={c.color} />
              </View>
              <Text style={[styles.cardTitle, { color: colors.onBrandTertiary, fontFamily: fonts.serifSemi }]} numberOfLines={1}>
                {catLabel(c.key)}
              </Text>
              <View style={[styles.badge, { backgroundColor: colors.surface }]}>
                <Text style={[styles.badgeText, { color: colors.onSurfaceSecondary, fontFamily: fonts.sansSemi }]}>
                  {counts[c.key]}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>
        <Text style={[styles.note, { color: colors.onSurfaceTertiary, fontFamily: fonts.sans }]}>
          {t.categories.note}
        </Text>
      </ScrollView>
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
  subtitle: { fontSize: 13, marginTop: 2 },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", rowGap: 14 },
  card: {
    width: "48.5%",
    borderRadius: 18,
    padding: 16,
    minHeight: 120,
    justifyContent: "space-between",
  },
  iconWrap: { width: 46, height: 46, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  cardTitle: { fontSize: 19, marginTop: 12 },
  badge: {
    position: "absolute",
    top: 14,
    right: 14,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  badgeText: { fontSize: 12 },
  note: { fontSize: 12, marginTop: 20, lineHeight: 18, textAlign: "center" },
});
