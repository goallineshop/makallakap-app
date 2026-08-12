import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Speech from "expo-speech";
import React, { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, Share, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { EmptyState } from "@/src/components/EmptyState";
import { ProverbMiniCard } from "@/src/components/ProverbMiniCard";
import { useToast } from "@/src/components/Toast";
import { useTheme } from "@/src/context/ThemeContext";
import { useUserData } from "@/src/context/UserDataContext";
import { CATEGORY_MAP } from "@/src/data/categories";
import { useI18n } from "@/src/context/LanguageContext";
import { byCategory, getById, Proverb } from "@/src/services/proverbs";

export default function ProverbDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, fonts, spacing, proverbFont, type } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const toast = useToast();
  const { isFavorite, toggleFavorite, addRecent } = useUserData();
  const { t, catLabel } = useI18n();

  const proverb = id ? getById(id) : undefined;
  const fav = proverb ? isFavorite(proverb.id) : false;
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    if (proverb) addRecent(proverb.id);
  }, [proverb?.id]);

  useEffect(() => {
    return () => {
      Speech.stop();
    };
  }, []);

  const related = useMemo<Proverb[]>(() => {
    if (!proverb || proverb.categories.length === 0) return [];
    return byCategory(proverb.categories[0])
      .filter((p) => p.id !== proverb.id)
      .slice(0, 6);
  }, [proverb?.id]);

  if (!proverb) {
    return (
      <View style={[styles.container, { backgroundColor: colors.surface, paddingTop: insets.top }]}>
        <EmptyState title={t.detail.notFound} actionLabel={t.common.back} onAction={() => router.back()} />
      </View>
    );
  }

  const handleSpeak = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (speaking) {
      Speech.stop();
      setSpeaking(false);
      return;
    }
    const text = proverb.meaning ? `${proverb.proverb}. ${proverb.meaning}` : proverb.proverb;
    setSpeaking(true);
    Speech.speak(text, {
      language: "tr-TR",
      rate: 0.95,
      onDone: () => setSpeaking(false),
      onStopped: () => setSpeaking(false),
      onError: () => {
        setSpeaking(false);
        toast.show(t.common.ttsUnavailable, { icon: "volume-x", type: "error" });
      },
    });
  };

  const handleShare = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const parts = [proverb.proverb];
    if (proverb.meaning) parts.push(`\n${t.detail.meaning}: ${proverb.meaning}`);
    parts.push(`\n— ${t.appName}`);
    try {
      await Share.share({ message: parts.join("\n") });
    } catch {
      /* user cancelled */
    }
  };

  const handleFav = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const now = toggleFavorite(proverb.id);
    toast.show(now ? t.common.addedFav : t.common.removedFav, {
      icon: now ? "heart" : "x",
      type: now ? "success" : "info",
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      {/* Floating back */}
      <View style={[styles.topBar, { paddingTop: insets.top + 6 }]}>
        <Pressable
          testID="detail-back-button"
          onPress={() => router.back()}
          hitSlop={10}
          style={({ pressed }) => [
            styles.backBtn,
            { backgroundColor: colors.surfaceSecondary, opacity: pressed ? 0.6 : 1 },
          ]}
        >
          <Feather name="chevron-left" size={24} color={colors.onSurface} />
        </Pressable>
      </View>

      <ScrollView
        testID="detail-scroll"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: spacing.lg,
          paddingTop: 4,
          paddingBottom: insets.bottom + 100,
        }}
      >
        {/* Category chips */}
        {proverb.categories.length > 0 && (
          <View style={styles.chipRow}>
            {proverb.categories.map((key) => {
              const meta = CATEGORY_MAP[key];
              if (!meta) return null;
              return (
                <Pressable
                  key={key}
                  testID={`detail-cat-${key}`}
                  onPress={() => router.push(`/category/${encodeURIComponent(key)}`)}
                  style={[styles.chip, { backgroundColor: colors.brandTertiary }]}
                >
                  <Text style={[styles.chipText, { color: colors.onBrandTertiary, fontFamily: fonts.sansSemi }]}>
                    {catLabel(key)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}

        {/* Proverb */}
        <Text
          testID="detail-proverb"
          style={[styles.proverb, { color: colors.onSurface, fontFamily: proverbFont, fontSize: type(30) }]}
        >
          {proverb.proverb}
        </Text>

        <View style={[styles.divider, { backgroundColor: colors.brandSecondary }]} />

        {/* Meaning */}
        {proverb.meaning ? (
          <Section label={t.detail.meaning} text={proverb.meaning} />
        ) : null}

        {/* Explanation */}
        {proverb.explanation ? (
          <Section label={t.detail.explanation} text={proverb.explanation} />
        ) : null}

        {!proverb.meaning && !proverb.explanation ? (
          <Text style={[styles.noExtra, { color: colors.onSurfaceTertiary, fontFamily: fonts.sans }]}>
            {t.detail.noExtra}
          </Text>
        ) : null}

        {/* Related */}
        {related.length > 0 && (
          <View style={{ marginTop: 28 }}>
            <Text style={[styles.relatedTitle, { color: colors.onSurface, fontFamily: fonts.serifBold }]}>
              {t.detail.related}
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 12, paddingRight: 4 }}
            >
              {related.map((p) => (
                <ProverbMiniCard key={p.id} proverb={p} onPress={() => router.push(`/proverb/${p.id}`)} />
              ))}
            </ScrollView>
          </View>
        )}
      </ScrollView>

      {/* Sticky action bar */}
      <View
        style={[
          styles.actionBar,
          {
            paddingBottom: insets.bottom + 10,
            backgroundColor: colors.surface,
            borderTopColor: colors.divider,
          },
        ]}
      >
        <ActionButton
          testID="detail-tts-button"
          icon={speaking ? "square" : "volume-2"}
          label={speaking ? t.detail.stop : t.detail.speak}
          onPress={handleSpeak}
          active={speaking}
        />
        <ActionButton testID="detail-share-button" icon="share-2" label={t.detail.share} onPress={handleShare} />
        <ActionButton
          testID="detail-fav-button"
          icon="heart"
          label={fav ? t.detail.removeFav : t.detail.addFav}
          onPress={handleFav}
          active={fav}
          filled={fav}
        />
      </View>
    </View>
  );
}

function Section({ label, text }: { label: string; text: string }) {
  const { colors, fonts, type } = useTheme();
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionLabel, { color: colors.brandPrimary, fontFamily: fonts.sansBold }]}>
        {label}
      </Text>
      <Text style={[styles.sectionText, { color: colors.onSurfaceSecondary, fontFamily: fonts.sans, fontSize: type(16) }]}>
        {text}
      </Text>
    </View>
  );
}

function ActionButton({
  icon,
  label,
  onPress,
  testID,
  active,
  filled,
}: {
  icon: string;
  label: string;
  onPress: () => void;
  testID?: string;
  active?: boolean;
  filled?: boolean;
}) {
  const { colors, fonts } = useTheme();
  const color = active ? colors.brandPrimary : colors.onSurface;
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      style={({ pressed }) => [styles.actionBtn, { opacity: pressed ? 0.6 : 1 }]}
    >
      <Feather name={icon as any} size={22} color={color} />
      <Text style={[styles.actionLabel, { color, fontFamily: fonts.sansMed }]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: { paddingHorizontal: 16, paddingBottom: 6 },
  backBtn: { width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center" },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16, marginTop: 4 },
  chip: { borderRadius: 999, paddingHorizontal: 14, paddingVertical: 6 },
  chipText: { fontSize: 12 },
  proverb: { lineHeight: 40 },
  divider: { height: 3, width: 56, borderRadius: 2, marginTop: 16, marginBottom: 8 },
  section: { marginTop: 20 },
  sectionLabel: { fontSize: 13, letterSpacing: 0.6, textTransform: "uppercase", marginBottom: 8 },
  sectionText: { lineHeight: 26 },
  noExtra: { fontSize: 14, marginTop: 20, fontStyle: "italic" },
  relatedTitle: { fontSize: 22, marginBottom: 12 },
  actionBar: {
    flexDirection: "row",
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 12,
    paddingHorizontal: 16,
  },
  actionBtn: { flex: 1, alignItems: "center", gap: 5 },
  actionLabel: { fontSize: 12 },
});
