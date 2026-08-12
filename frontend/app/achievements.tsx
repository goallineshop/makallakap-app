import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { ScreenHeader } from "@/src/components/ScreenHeader";
import { useTheme } from "@/src/context/ThemeContext";
import { useUserData } from "@/src/context/UserDataContext";
import { useI18n } from "@/src/context/LanguageContext";

export default function AchievementsScreen() {
  const { colors, fonts, spacing } = useTheme();
  const router = useRouter();
  const { achievements, streak } = useUserData();
  const { t } = useI18n();

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <ScreenHeader title={t.achievements.title} subtitle={t.achievements.subtitle} onBack={() => router.back()} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing["3xl"] }}
      >
        {/* Streak card */}
        <View style={[styles.streakCard, { backgroundColor: colors.surfaceInverse }]}>
          <View style={styles.streakHeader}>
            <Feather name="zap" size={20} color={colors.brandSecondary} />
            <Text style={[styles.streakTitle, { color: colors.onSurfaceInverse, fontFamily: fonts.serifBold }]}>
              {t.achievements.streakTitle}
            </Text>
          </View>
          <View style={styles.streakRow}>
            <View style={styles.streakStat}>
              <Text style={[styles.streakValue, { color: colors.brandSecondary, fontFamily: fonts.serifBold }]}>
                {streak.current}
              </Text>
              <Text style={[styles.streakLabel, { color: colors.onSurfaceInverse, fontFamily: fonts.sans }]}>
                {t.achievements.current}
              </Text>
            </View>
            <View style={[styles.streakSep, { backgroundColor: colors.brandTertiary }]} />
            <View style={styles.streakStat}>
              <Text style={[styles.streakValue, { color: colors.onSurfaceInverse, fontFamily: fonts.serifBold }]}>
                {streak.longest}
              </Text>
              <Text style={[styles.streakLabel, { color: colors.onSurfaceInverse, fontFamily: fonts.sans }]}>
                {t.achievements.longest}
              </Text>
            </View>
          </View>
        </View>

        {/* Badges */}
        <View style={styles.grid}>
          {achievements.map((a) => {
            const pct = Math.min(1, a.value / a.def.target);
            return (
              <View
                key={a.def.id}
                testID={`achievement-${a.def.id}`}
                style={[
                  styles.badge,
                  {
                    backgroundColor: a.unlocked ? colors.brandTertiary : colors.surfaceSecondary,
                    borderColor: a.unlocked ? colors.brandPrimary : colors.border,
                  },
                ]}
              >
                <View
                  style={[
                    styles.badgeIcon,
                    { backgroundColor: a.unlocked ? colors.brandPrimary : colors.surfaceTertiary },
                  ]}
                >
                  <Feather
                    name={(a.unlocked ? a.def.icon : "lock") as any}
                    size={22}
                    color={a.unlocked ? colors.onBrandPrimary : colors.onSurfaceTertiary}
                  />
                </View>
                <Text
                  style={[styles.badgeTitle, { color: colors.onSurface, fontFamily: fonts.serifSemi }]}
                  numberOfLines={2}
                >
                  {a.def.title}
                </Text>
                <Text
                  style={[styles.badgeDesc, { color: colors.onSurfaceSecondary, fontFamily: fonts.sans }]}
                  numberOfLines={2}
                >
                  {a.def.desc}
                </Text>
                <View style={[styles.progressTrack, { backgroundColor: colors.surfaceTertiary }]}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${pct * 100}%`, backgroundColor: a.unlocked ? colors.success : colors.brandSecondary },
                    ]}
                  />
                </View>
                <Text style={[styles.progressText, { color: colors.onSurfaceTertiary, fontFamily: fonts.sansMed }]}>
                  {a.unlocked ? t.achievements.unlocked : t.achievements.progress(Math.min(a.value, a.def.target), a.def.target)}
                </Text>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  streakCard: { borderRadius: 20, padding: 20, marginBottom: 20 },
  streakHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 16 },
  streakTitle: { fontSize: 20 },
  streakRow: { flexDirection: "row", alignItems: "center" },
  streakStat: { flex: 1, alignItems: "center" },
  streakValue: { fontSize: 40, lineHeight: 46 },
  streakLabel: { fontSize: 12, marginTop: 2 },
  streakSep: { width: 1, height: 44 },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", rowGap: 14 },
  badge: {
    width: "48.5%",
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    alignItems: "center",
  },
  badgeIcon: { width: 50, height: 50, borderRadius: 25, alignItems: "center", justifyContent: "center", marginBottom: 10 },
  badgeTitle: { fontSize: 17, textAlign: "center" },
  badgeDesc: { fontSize: 11, textAlign: "center", marginTop: 4, minHeight: 28, lineHeight: 15 },
  progressTrack: { height: 6, borderRadius: 3, width: "100%", marginTop: 10, overflow: "hidden" },
  progressFill: { height: 6, borderRadius: 3 },
  progressText: { fontSize: 11, marginTop: 6 },
});
