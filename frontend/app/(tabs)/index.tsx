import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { SectionHeader } from "@/src/components/SectionHeader";
import { ProverbMiniCard } from "@/src/components/ProverbMiniCard";
import { CategoryIcon } from "@/src/components/CategoryIcon";
import { useTheme } from "@/src/context/ThemeContext";
import { useUserData } from "@/src/context/UserDataContext";
import { CATEGORIES } from "@/src/data/categories";
import { useI18n } from "@/src/context/LanguageContext";
import {
  featuredProverbs,
  getById,
  PROVERB_COUNT,
  proverbOfDay,
  randomProverb,
} from "@/src/services/proverbs";

const HERO_IMG =
  "https://images.unsplash.com/photo-1642978347542-c6f9db1fe1a6?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMjd8MHwxfHNlYXJjaHwxfHxidXJndW5keSUyMHJlZCUyMGFuZCUyMGdvbGQlMjBhYnN0cmFjdCUyMHRleHR1cmUlMjBiYWNrZ3JvdW5kfGVufDB8fHx8MTc4NjU1OTM0NXww&ixlib=rb-4.1.0&q=85";

export default function HomeScreen() {
  const { colors, fonts, spacing, proverbFont, type } = useTheme();
  const { recent, favorites, streak } = useUserData();
  const { t, catLabel } = useI18n();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const daily = useMemo(() => proverbOfDay(), []);
  const featured = useMemo(() => featuredProverbs(8), []);

  const recentProverbs = recent
    .map((id) => getById(id))
    .filter(Boolean)
    .slice(0, 10) as ReturnType<typeof getById>[];

  const goRandom = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const p = randomProverb();
    router.push(`/proverb/${p.id}`);
  };

  const quickActions = [
    { key: "random", icon: "shuffle", label: t.home.random, onPress: goRandom },
    { key: "quiz", icon: "help-circle", label: t.tabs.quiz, onPress: () => router.push("/(tabs)/quiz") },
    { key: "fav", icon: "heart", label: t.tabs.favorites, onPress: () => router.push("/(tabs)/favorites") },
    { key: "badge", icon: "award", label: t.home.achievements, onPress: () => router.push("/achievements") },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      {/* Sticky header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + 8,
            backgroundColor: colors.surface,
            borderBottomColor: colors.divider,
          },
        ]}
      >
        <View>
          <Text style={[styles.logo, { color: colors.brandPrimary, fontFamily: fonts.serifBold }]}>
            {t.appName}
          </Text>
          <Text style={[styles.tagline, { color: colors.onSurfaceSecondary, fontFamily: fonts.sans }]}>
            {t.tagline}
          </Text>
        </View>
        <Pressable
          testID="home-settings-button"
          onPress={() => router.push("/settings")}
          hitSlop={10}
          style={({ pressed }) => [
            styles.cog,
            { backgroundColor: colors.surfaceSecondary, opacity: pressed ? 0.6 : 1 },
          ]}
        >
          <Feather name="settings" size={20} color={colors.onSurface} />
        </Pressable>
      </View>

      <ScrollView
        testID="home-scroll"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing["3xl"] }}
      >
        {/* Stat pills */}
        <View style={styles.statRow}>
          <View style={[styles.statPill, { backgroundColor: colors.surfaceSecondary }]}>
            <Feather name="zap" size={16} color={colors.brandSecondary} />
            <Text style={[styles.statValue, { color: colors.onSurface, fontFamily: fonts.sansBold }]}>
              {streak.current}
            </Text>
            <Text style={[styles.statLabel, { color: colors.onSurfaceSecondary, fontFamily: fonts.sans }]}>
              {t.home.streak.toLowerCase()}
            </Text>
          </View>
          <View style={[styles.statPill, { backgroundColor: colors.surfaceSecondary }]}>
            <Feather name="book" size={16} color={colors.brandPrimary} />
            <Text style={[styles.statValue, { color: colors.onSurface, fontFamily: fonts.sansBold }]}>
              {PROVERB_COUNT}
            </Text>
            <Text style={[styles.statLabel, { color: colors.onSurfaceSecondary, fontFamily: fonts.sans }]}>
              {t.home.totalProverbs}
            </Text>
          </View>
        </View>

        {/* Günün Atasözü hero */}
        <Pressable
          testID="daily-proverb-card"
          onPress={() => router.push(`/proverb/${daily.id}`)}
          style={({ pressed }) => [styles.hero, { opacity: pressed ? 0.94 : 1 }]}
        >
          <LinearGradient
            colors={[colors.brandPrimary, "#5C1217"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <Image source={{ uri: HERO_IMG }} style={[StyleSheet.absoluteFill, { opacity: 0.28 }]} contentFit="cover" transition={400} />
          <LinearGradient
            colors={["rgba(26,20,18,0.0)", "rgba(26,20,18,0.85)"]}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.heroContent}>
            <View style={styles.heroBadge}>
              <Feather name="sun" size={13} color="#F5D6D8" />
              <Text style={[styles.heroBadgeText, { fontFamily: fonts.sansSemi }]}>{t.home.proverbOfDay}</Text>
            </View>
            <Text style={[styles.heroProverb, { fontFamily: proverbFont, fontSize: type(26) }]} numberOfLines={4}>
              {daily.proverb}
            </Text>
            {daily.meaning ? (
              <Text style={[styles.heroMeaning, { fontFamily: fonts.sans, fontSize: type(13) }]} numberOfLines={2}>
                {daily.meaning}
              </Text>
            ) : null}
          </View>
        </Pressable>

        {/* Quick actions */}
        <View style={styles.quickRow}>
          {quickActions.map((a) => (
            <Pressable
              key={a.key}
              testID={`quick-${a.key}`}
              onPress={a.onPress}
              style={({ pressed }) => [
                styles.quickCard,
                { backgroundColor: colors.surfaceSecondary, borderColor: colors.border, opacity: pressed ? 0.7 : 1 },
              ]}
            >
              <View style={[styles.quickIcon, { backgroundColor: colors.brandTertiary }]}>
                <Feather name={a.icon as any} size={20} color={colors.onBrandTertiary} />
              </View>
              <Text style={[styles.quickLabel, { color: colors.onSurface, fontFamily: fonts.sansMed }]} numberOfLines={1}>
                {a.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Quiz banner */}
        <Pressable
          testID="quiz-banner"
          onPress={() => router.push("/(tabs)/quiz")}
          style={({ pressed }) => [
            styles.quizBanner,
            { backgroundColor: colors.surfaceInverse, opacity: pressed ? 0.9 : 1 },
          ]}
        >
          <View style={{ flex: 1 }}>
            <Text style={[styles.quizTitle, { color: colors.onSurfaceInverse, fontFamily: fonts.serifBold }]}>
              {t.home.startQuiz}
            </Text>
            <Text style={[styles.quizSub, { color: colors.brandSecondary, fontFamily: fonts.sans }]}>
              {t.home.quizBanner}
            </Text>
          </View>
          <View style={[styles.quizIcon, { backgroundColor: colors.brandPrimary }]}>
            <Feather name="play" size={22} color={colors.onBrandPrimary} />
          </View>
        </Pressable>

        {/* Öne Çıkan */}
        <View style={styles.section}>
          <SectionHeader title={t.home.featured} icon="star" />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 12, paddingRight: 4 }}
          >
            {featured.map((p) => (
              <ProverbMiniCard key={p.id} proverb={p} onPress={() => router.push(`/proverb/${p.id}`)} />
            ))}
          </ScrollView>
        </View>

        {/* Kategoriler */}
        <View style={styles.section}>
          <SectionHeader
            title={t.home.categories}
            icon="grid"
            actionLabel={t.home.seeAll}
            onAction={() => router.push("/(tabs)/categories")}
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 10, paddingRight: 4 }}
          >
            {CATEGORIES.slice(0, 12).map((c) => (
              <Pressable
                key={c.key}
                testID={`home-cat-${c.key}`}
                onPress={() => router.push(`/category/${encodeURIComponent(c.key)}`)}
                style={({ pressed }) => [
                  styles.catChip,
                  { backgroundColor: colors.surfaceSecondary, borderColor: colors.border, opacity: pressed ? 0.7 : 1 },
                ]}
              >
                <CategoryIcon icon={c.icon} lib={c.lib} size={18} color={c.color} />
                <Text style={[styles.catChipText, { color: colors.onSurface, fontFamily: fonts.sansMed }]}>
                  {catLabel(c.key)}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Son Görüntülenenler */}
        {recentProverbs.length > 0 && (
          <View style={styles.section}>
            <SectionHeader
              title={t.home.recent}
              icon="clock"
              actionLabel={t.home.seeAll}
              onAction={() => router.push("/recent")}
            />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 12, paddingRight: 4 }}
            >
              {recentProverbs.map((p) =>
                p ? (
                  <ProverbMiniCard key={p.id} proverb={p} onPress={() => router.push(`/proverb/${p.id}`)} />
                ) : null,
              )}
            </ScrollView>
          </View>
        )}

        {/* Favoriler summary */}
        {favorites.length > 0 && (
          <Pressable
            testID="home-favorites-card"
            onPress={() => router.push("/(tabs)/favorites")}
            style={({ pressed }) => [
              styles.favCard,
              { backgroundColor: colors.brandTertiary, opacity: pressed ? 0.85 : 1 },
            ]}
          >
            <Feather name="heart" size={22} color={colors.onBrandTertiary} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.favTitle, { color: colors.onBrandTertiary, fontFamily: fonts.serifBold }]}>
                {t.home.favorites}
              </Text>
              <Text style={[styles.favSub, { color: colors.onBrandTertiary, fontFamily: fonts.sans }]}>
                {t.favorites.count(favorites.length)}
              </Text>
            </View>
            <Feather name="chevron-right" size={20} color={colors.onBrandTertiary} />
          </Pressable>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  logo: { fontSize: 28, letterSpacing: 0.5 },
  tagline: { fontSize: 11, marginTop: -2 },
  cog: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },

  statRow: { flexDirection: "row", gap: 12, marginBottom: 16 },
  statPill: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  statValue: { fontSize: 18 },
  statLabel: { fontSize: 12, flexShrink: 1 },

  hero: {
    height: 220,
    borderRadius: 24,
    overflow: "hidden",
    marginBottom: 16,
    justifyContent: "flex-end",
  },
  heroContent: { padding: 20 },
  heroBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    marginBottom: 10,
  },
  heroBadgeText: { color: "#F5D6D8", fontSize: 12, letterSpacing: 0.5 },
  heroProverb: { color: "#FFFFFF", lineHeight: 32 },
  heroMeaning: { color: "#EAD9C9", marginTop: 8, lineHeight: 18 },

  quickRow: { flexDirection: "row", gap: 10, marginBottom: 16 },
  quickCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    paddingVertical: 14,
    gap: 8,
  },
  quickIcon: { width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center" },
  quickLabel: { fontSize: 11 },

  quizBanner: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    padding: 18,
    marginBottom: 24,
    gap: 12,
  },
  quizTitle: { fontSize: 22 },
  quizSub: { fontSize: 12, marginTop: 2 },
  quizIcon: { width: 46, height: 46, borderRadius: 23, alignItems: "center", justifyContent: "center" },

  section: { marginBottom: 24 },

  catChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 999,
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  catChipText: { fontSize: 13 },

  favCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 18,
    padding: 16,
  },
  favTitle: { fontSize: 20 },
  favSub: { fontSize: 12, marginTop: 1 },
});
