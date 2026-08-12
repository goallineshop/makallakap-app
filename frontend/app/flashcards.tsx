import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useMemo, useRef, useState } from "react";
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

import { EmptyState } from "@/src/components/EmptyState";
import { ScreenHeader } from "@/src/components/ScreenHeader";
import { useTheme } from "@/src/context/ThemeContext";
import { useUserData } from "@/src/context/UserDataContext";
import { useI18n } from "@/src/context/LanguageContext";
import { getById, Proverb, PROVERBS } from "@/src/services/proverbs";

const DECK_SIZE = 30;

function sampleRandom(n: number): Proverb[] {
  const idx = PROVERBS.map((_, i) => i);
  for (let i = idx.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  return idx.slice(0, n).map((i) => PROVERBS[i]);
}

type Source = "random" | "favorites";

function Flashcard({
  proverb,
  width,
  height,
}: {
  proverb: Proverb;
  width: number;
  height: number;
}) {
  const { colors, fonts, proverbFont, type } = useTheme();
  const { t } = useI18n();
  const anim = useRef(new Animated.Value(0)).current;
  const [flipped, setFlipped] = useState(false);

  const flip = () => {
    Haptics.selectionAsync();
    Animated.spring(anim, { toValue: flipped ? 0 : 1, useNativeDriver: true, friction: 9, tension: 12 }).start();
    setFlipped((f) => !f);
  };

  const frontRotate = anim.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "180deg"] });
  const backRotate = anim.interpolate({ inputRange: [0, 1], outputRange: ["180deg", "360deg"] });

  return (
    <View style={[styles.page, { width }]}>
      <Pressable testID={`flashcard-${proverb.id}`} onPress={flip} style={{ height }}>
        {/* Front */}
        <Animated.View
          style={[
            styles.card,
            {
              backgroundColor: colors.surfaceSecondary,
              borderColor: colors.borderStrong,
              transform: [{ perspective: 1000 }, { rotateY: frontRotate }],
            },
          ]}
        >
          <View style={[styles.faceBadge, { backgroundColor: colors.brandTertiary }]}>
            <Text style={[styles.faceBadgeText, { color: colors.onBrandTertiary, fontFamily: fonts.sansSemi }]}>
              {t.flashcards.front}
            </Text>
          </View>
          <Text
            style={[styles.cardProverb, { color: colors.onSurface, fontFamily: proverbFont, fontSize: type(28) }]}
          >
            {proverb.proverb}
          </Text>
          <View style={styles.flipHint}>
            <Feather name="refresh-cw" size={13} color={colors.onSurfaceTertiary} />
            <Text style={[styles.flipHintText, { color: colors.onSurfaceTertiary, fontFamily: fonts.sans }]}>
              {t.flashcards.tapToFlip}
            </Text>
          </View>
        </Animated.View>

        {/* Back */}
        <Animated.View
          style={[
            styles.card,
            styles.cardBack,
            {
              backgroundColor: colors.brandPrimary,
              borderColor: colors.brandPrimary,
              transform: [{ perspective: 1000 }, { rotateY: backRotate }],
            },
          ]}
        >
          <View style={[styles.faceBadge, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
            <Text style={[styles.faceBadgeText, { color: colors.onBrandPrimary, fontFamily: fonts.sansSemi }]}>
              {t.flashcards.back}
            </Text>
          </View>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ justifyContent: "center", flexGrow: 1 }}>
            <Text style={[styles.backMeaning, { color: colors.onBrandPrimary, fontFamily: fonts.serifSemi, fontSize: type(22) }]}>
              {proverb.meaning || proverb.proverb}
            </Text>
            {proverb.explanation ? (
              <Text style={[styles.backExp, { color: "#F5D6D8", fontFamily: fonts.sans, fontSize: type(14) }]}>
                {proverb.explanation}
              </Text>
            ) : null}
          </ScrollView>
        </Animated.View>
      </Pressable>
    </View>
  );
}

export default function FlashcardsScreen() {
  const { colors, fonts, spacing } = useTheme();
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const { favorites, isFavorite, toggleFavorite } = useUserData();
  const { t } = useI18n();
  const scrollRef = useRef<ScrollView>(null);

  const [source, setSource] = useState<Source>("random");
  const [randomSeed, setRandomSeed] = useState(0);
  const [index, setIndex] = useState(0);

  const deck = useMemo<Proverb[]>(() => {
    if (source === "favorites") {
      return favorites.map((id) => getById(id)).filter(Boolean) as Proverb[];
    }
    return sampleRandom(DECK_SIZE);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source, randomSeed, favorites]);

  const cardHeight = Math.min(500, height * 0.56);

  const changeSource = (s: Source) => {
    Haptics.selectionAsync();
    setSource(s);
    setIndex(0);
    scrollRef.current?.scrollTo({ x: 0, animated: false });
  };

  const shuffle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRandomSeed((s) => s + 1);
    setIndex(0);
    scrollRef.current?.scrollTo({ x: 0, animated: false });
  };

  const goTo = (i: number) => {
    const clamped = Math.max(0, Math.min(deck.length - 1, i));
    setIndex(clamped);
    scrollRef.current?.scrollTo({ x: clamped * width, animated: true });
  };

  const current = deck[index];
  const fav = current ? isFavorite(current.id) : false;

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <ScreenHeader
        title={t.flashcards.title}
        subtitle={t.flashcards.subtitle}
        onBack={() => router.back()}
        right={
          source === "random" && deck.length > 0 ? (
            <Pressable testID="flashcards-shuffle" onPress={shuffle} hitSlop={10}>
              <Feather name="shuffle" size={20} color={colors.brandPrimary} />
            </Pressable>
          ) : undefined
        }
      />

      {/* Source selector */}
      <View style={styles.sourceRow}>
        <View style={[styles.segment, { backgroundColor: colors.surfaceSecondary }]}>
          {(["random", "favorites"] as Source[]).map((s) => {
            const active = s === source;
            return (
              <Pressable
                key={s}
                testID={`flashcards-source-${s}`}
                onPress={() => changeSource(s)}
                style={[styles.segmentItem, active && { backgroundColor: colors.brandPrimary }]}
              >
                <Text
                  style={[
                    styles.segmentText,
                    { color: active ? colors.onBrandPrimary : colors.onSurfaceSecondary, fontFamily: active ? fonts.sansSemi : fonts.sansMed },
                  ]}
                >
                  {s === "random" ? t.flashcards.random : t.flashcards.favorites}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {deck.length === 0 ? (
        <EmptyState
          title={t.flashcards.emptyFav}
          hint={t.flashcards.emptyFavHint}
          actionLabel={t.browse.title}
          onAction={() => router.push("/(tabs)/browse")}
        />
      ) : (
        <>
          <ScrollView
            ref={scrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              const i = Math.round(e.nativeEvent.contentOffset.x / width);
              setIndex(i);
            }}
            style={{ flexGrow: 0 }}
            contentContainerStyle={{ alignItems: "center" }}
          >
            {deck.map((p) => (
              <Flashcard key={p.id} proverb={p} width={width} height={cardHeight} />
            ))}
          </ScrollView>

          {/* Controls */}
          <View style={[styles.controls, { paddingHorizontal: spacing.lg }]}>
            <Pressable
              testID="flashcards-prev"
              onPress={() => goTo(index - 1)}
              disabled={index === 0}
              style={({ pressed }) => [
                styles.navBtn,
                { backgroundColor: colors.surfaceSecondary, opacity: index === 0 ? 0.4 : pressed ? 0.7 : 1 },
              ]}
            >
              <Feather name="chevron-left" size={24} color={colors.onSurface} />
            </Pressable>

            <View style={styles.center}>
              <Text style={[styles.progress, { color: colors.onSurface, fontFamily: fonts.sansBold }]}>
                {t.flashcards.progress(index + 1, deck.length)}
              </Text>
              <Pressable
                testID="flashcards-fav"
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  if (current) toggleFavorite(current.id);
                }}
                style={[styles.favPill, { backgroundColor: fav ? colors.brandTertiary : colors.surfaceSecondary }]}
              >
                <Feather name="heart" size={16} color={fav ? colors.brandPrimary : colors.onSurfaceTertiary} />
                <Text style={[styles.favText, { color: fav ? colors.brandPrimary : colors.onSurfaceSecondary, fontFamily: fonts.sansMed }]}>
                  {fav ? t.detail.removeFav : t.detail.addFav}
                </Text>
              </Pressable>
            </View>

            <Pressable
              testID="flashcards-next"
              onPress={() => goTo(index + 1)}
              disabled={index >= deck.length - 1}
              style={({ pressed }) => [
                styles.navBtn,
                { backgroundColor: colors.surfaceSecondary, opacity: index >= deck.length - 1 ? 0.4 : pressed ? 0.7 : 1 },
              ]}
            >
              <Feather name="chevron-right" size={24} color={colors.onSurface} />
            </Pressable>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  sourceRow: { paddingHorizontal: 16, paddingVertical: 12 },
  segment: { flexDirection: "row", borderRadius: 12, padding: 4, gap: 4 },
  segmentItem: { flex: 1, paddingVertical: 9, borderRadius: 9, alignItems: "center" },
  segmentText: { fontSize: 13 },
  page: { paddingHorizontal: 20, justifyContent: "center" },
  card: {
    position: "absolute",
    top: 0,
    left: 20,
    right: 20,
    bottom: 0,
    borderRadius: 24,
    borderWidth: 1.5,
    padding: 24,
    justifyContent: "center",
    backfaceVisibility: "hidden",
  },
  cardBack: {},
  faceBadge: {
    position: "absolute",
    top: 18,
    left: 18,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  faceBadgeText: { fontSize: 11, letterSpacing: 0.5, textTransform: "uppercase" },
  cardProverb: { textAlign: "center", lineHeight: 38 },
  flipHint: { position: "absolute", bottom: 18, left: 0, right: 0, flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 6 },
  flipHintText: { fontSize: 12 },
  backMeaning: { textAlign: "center", lineHeight: 30 },
  backExp: { marginTop: 14, lineHeight: 21, textAlign: "center" },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    gap: 12,
  },
  navBtn: { width: 52, height: 52, borderRadius: 26, alignItems: "center", justifyContent: "center" },
  center: { alignItems: "center", gap: 10, flex: 1 },
  progress: { fontSize: 16 },
  favPill: { flexDirection: "row", alignItems: "center", gap: 6, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8 },
  favText: { fontSize: 13 },
});
