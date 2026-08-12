import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTheme } from "@/src/context/ThemeContext";
import { useUserData } from "@/src/context/UserDataContext";
import { TR } from "@/src/i18n/tr";
import { Difficulty } from "@/src/services/quiz";

const MODES = [
  { key: "complete", icon: "edit-3", ...TR.quiz.modes.complete },
  { key: "meaning", icon: "list", ...TR.quiz.modes.meaning },
  { key: "word", icon: "type", ...TR.quiz.modes.word },
] as const;

const DIFFICULTIES: { key: Difficulty; label: string }[] = [
  { key: "easy", label: TR.quiz.easy },
  { key: "medium", label: TR.quiz.medium },
  { key: "hard", label: TR.quiz.hard },
];

export default function QuizHubScreen() {
  const { colors, fonts, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { quizStats, streak, achievements } = useUserData();

  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [timed, setTimed] = useState(false);

  const unlocked = achievements.filter((a) => a.unlocked).length;

  const stats = [
    { icon: "play-circle", label: TR.quiz.games, value: quizStats.games },
    { icon: "check-circle", label: TR.quiz.totalCorrect, value: quizStats.totalCorrect },
    { icon: "star", label: TR.quiz.best, value: quizStats.bestScore },
  ];

  const startMode = (mode: string) => {
    router.push(`/quiz/play?mode=${mode}&difficulty=${difficulty}&timed=${timed ? 1 : 0}`);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <View
        style={[
          styles.header,
          { paddingTop: insets.top + 8, backgroundColor: colors.surface, borderBottomColor: colors.divider },
        ]}
      >
        <Text style={[styles.title, { color: colors.onSurface, fontFamily: fonts.serifBold }]}>
          {TR.quiz.title}
        </Text>
        <Text style={[styles.subtitle, { color: colors.onSurfaceSecondary, fontFamily: fonts.sans }]}>
          {TR.quiz.subtitle}
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing["3xl"] }}
      >
        {/* Stats row */}
        <View style={styles.statRow}>
          {stats.map((s) => (
            <View key={s.label} style={[styles.statCard, { backgroundColor: colors.surfaceSecondary }]}>
              <Feather name={s.icon as any} size={18} color={colors.brandPrimary} />
              <Text style={[styles.statValue, { color: colors.onSurface, fontFamily: fonts.sansBold }]}>
                {s.value}
              </Text>
              <Text style={[styles.statLabel, { color: colors.onSurfaceSecondary, fontFamily: fonts.sans }]} numberOfLines={1}>
                {s.label}
              </Text>
            </View>
          ))}
        </View>

        {/* Difficulty + timed */}
        <View style={[styles.optionCard, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
          <Text style={[styles.optionLabel, { color: colors.brandPrimary, fontFamily: fonts.sansBold }]}>
            {TR.quiz.difficulty}
          </Text>
          <View style={[styles.segment, { backgroundColor: colors.surfaceTertiary }]}>
            {DIFFICULTIES.map((d) => {
              const active = d.key === difficulty;
              return (
                <Pressable
                  key={d.key}
                  testID={`difficulty-${d.key}`}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setDifficulty(d.key);
                  }}
                  style={[styles.segmentItem, active && { backgroundColor: colors.brandPrimary }]}
                >
                  <Text
                    style={[
                      styles.segmentText,
                      { color: active ? colors.onBrandPrimary : colors.onSurfaceSecondary, fontFamily: active ? fonts.sansSemi : fonts.sansMed },
                    ]}
                  >
                    {d.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <View style={[styles.timedRow, { borderTopColor: colors.border }]}>
            <View style={styles.timedLeft}>
              <Feather name="clock" size={18} color={colors.onSurface} />
              <Text style={[styles.timedText, { color: colors.onSurface, fontFamily: fonts.sansMed }]}>
                {TR.quiz.timed}
              </Text>
            </View>
            <Switch
              testID="timed-switch"
              value={timed}
              onValueChange={(v) => {
                Haptics.selectionAsync();
                setTimed(v);
              }}
              trackColor={{ false: colors.surfaceTertiary, true: colors.brandPrimary }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* Mode cards */}
        {MODES.map((m) => (
          <Pressable
            key={m.key}
            testID={`quiz-mode-${m.key}`}
            onPress={() => startMode(m.key)}
            style={({ pressed }) => [
              styles.modeCard,
              { backgroundColor: colors.surfaceSecondary, borderColor: colors.border, opacity: pressed ? 0.85 : 1 },
            ]}
          >
            <View style={[styles.modeIcon, { backgroundColor: colors.brandTertiary }]}>
              <Feather name={m.icon as any} size={22} color={colors.onBrandTertiary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.modeTitle, { color: colors.onSurface, fontFamily: fonts.serifSemi }]}>
                {m.title}
              </Text>
              <Text style={[styles.modeDesc, { color: colors.onSurfaceSecondary, fontFamily: fonts.sans }]}>
                {m.desc}
              </Text>
            </View>
            <Feather name="chevron-right" size={22} color={colors.onSurfaceTertiary} />
          </Pressable>
        ))}

        {/* Flashcards */}
        <Pressable
          testID="flashcards-entry"
          onPress={() => router.push("/flashcards")}
          style={({ pressed }) => [
            styles.modeCard,
            { backgroundColor: colors.brandTertiary, borderColor: colors.borderStrong, opacity: pressed ? 0.85 : 1 },
          ]}
        >
          <View style={[styles.modeIcon, { backgroundColor: colors.brandPrimary }]}>
            <Feather name="layers" size={22} color={colors.onBrandPrimary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.modeTitle, { color: colors.onBrandTertiary, fontFamily: fonts.serifSemi }]}>
              {TR.quiz.flashcardsCard}
            </Text>
            <Text style={[styles.modeDesc, { color: colors.onBrandTertiary, fontFamily: fonts.sans }]}>
              {TR.quiz.flashcardsDesc}
            </Text>
          </View>
          <Feather name="chevron-right" size={22} color={colors.onBrandTertiary} />
        </Pressable>

        {/* Achievements / streak link */}
        <Pressable
          testID="quiz-achievements-link"
          onPress={() => router.push("/achievements")}
          style={({ pressed }) => [
            styles.achievement,
            { backgroundColor: colors.surfaceInverse, opacity: pressed ? 0.9 : 1 },
          ]}
        >
          <Feather name="award" size={22} color={colors.brandSecondary} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.achTitle, { color: colors.onSurfaceInverse, fontFamily: fonts.serifBold }]}>
              {TR.achievements.title}
            </Text>
            <Text style={[styles.achSub, { color: colors.brandSecondary, fontFamily: fonts.sans }]}>
              {unlocked} / {achievements.length} • {TR.achievements.current}: {streak.current} {TR.achievements.day}
            </Text>
          </View>
          <Feather name="chevron-right" size={20} color={colors.onSurfaceInverse} />
        </Pressable>
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
  statRow: { flexDirection: "row", gap: 12, marginBottom: 16 },
  statCard: { flex: 1, alignItems: "center", borderRadius: 16, paddingVertical: 16, gap: 4 },
  statValue: { fontSize: 20 },
  statLabel: { fontSize: 11 },
  optionCard: { borderRadius: 18, borderWidth: 1, padding: 16, marginBottom: 16 },
  optionLabel: { fontSize: 12, letterSpacing: 0.6, textTransform: "uppercase", marginBottom: 10 },
  segment: { flexDirection: "row", borderRadius: 12, padding: 4, gap: 4 },
  segmentItem: { flex: 1, paddingVertical: 9, borderRadius: 9, alignItems: "center" },
  segmentText: { fontSize: 13 },
  timedRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  timedLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  timedText: { fontSize: 14 },
  modeCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  modeIcon: { width: 48, height: 48, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  modeTitle: { fontSize: 19 },
  modeDesc: { fontSize: 13, marginTop: 1 },
  achievement: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderRadius: 18,
    padding: 16,
    marginTop: 12,
  },
  achTitle: { fontSize: 19 },
  achSub: { fontSize: 12, marginTop: 1 },
});
