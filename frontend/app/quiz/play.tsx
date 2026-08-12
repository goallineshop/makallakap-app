import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PrimaryButton } from "@/src/components/Buttons";
import { useTheme } from "@/src/context/ThemeContext";
import { useUserData } from "@/src/context/UserDataContext";
import { TR } from "@/src/i18n/tr";
import {
  Difficulty,
  DIFFICULTY_MULTIPLIER,
  generateQuiz,
  QuizMode,
  QuizQuestion,
  TIME_LIMITS,
} from "@/src/services/quiz";

export default function QuizPlayScreen() {
  const params = useLocalSearchParams<{ mode: QuizMode; difficulty: Difficulty; timed: string }>();
  const quizMode = (params.mode as QuizMode) || "complete";
  const difficulty = (params.difficulty as Difficulty) || "medium";
  const timed = params.timed === "1";
  const timeLimit = TIME_LIMITS[difficulty];
  const multiplier = DIFFICULTY_MULTIPLIER[difficulty];

  const { colors, fonts, spacing, proverbFont, type } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { recordQuizResult } = useUserData();

  const [questions, setQuestions] = useState<QuizQuestion[]>(() => generateQuiz(quizMode, difficulty));
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null); // -1 == timed out
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [points, setPoints] = useState(0);
  const [finished, setFinished] = useState(false);
  const [recorded, setRecorded] = useState(false);
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const total = questions.length;
  const q = questions[index];

  // Reset the countdown whenever the question changes.
  useEffect(() => {
    setTimeLeft(timeLimit);
  }, [index, timeLimit]);

  // Countdown ticker (timed mode only, before an answer is given).
  useEffect(() => {
    if (!timed || finished || selected !== null) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      setTimeLeft((t) => (t > 0 ? t - 1 : 0));
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [timed, finished, selected, index]);

  // Handle timeout.
  useEffect(() => {
    if (timed && timeLeft <= 0 && selected === null && !finished) {
      setSelected(-1);
      setWrong((w) => w + 1);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }, [timeLeft, timed, selected, finished]);

  const onSelect = (i: number) => {
    if (selected !== null) return;
    setSelected(i);
    if (i === q.answerIndex) {
      setCorrect((c) => c + 1);
      const timeBonus = timed ? Math.round((timeLeft / timeLimit) * 5) : 0;
      setPoints((p) => p + (10 + timeBonus) * multiplier);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      setWrong((w) => w + 1);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const next = () => {
    if (index + 1 >= total) {
      const score = Math.round((correct / total) * 100);
      if (!recorded) {
        recordQuizResult(correct, wrong, score);
        setRecorded(true);
      }
      setFinished(true);
    } else {
      setIndex((n) => n + 1);
      setSelected(null);
    }
  };

  const restart = () => {
    setQuestions(generateQuiz(quizMode, difficulty));
    setFinished(false);
    setRecorded(false);
    setIndex(0);
    setSelected(null);
    setCorrect(0);
    setWrong(0);
    setPoints(0);
    setTimeLeft(timeLimit);
  };

  // Results screen
  if (finished || total === 0) {
    const score = total > 0 ? Math.round((correct / total) * 100) : 0;
    return (
      <View style={[styles.container, { backgroundColor: colors.surface, paddingTop: insets.top }]}>
        <ScrollView contentContainerStyle={styles.resultWrap} showsVerticalScrollIndicator={false}>
          <View style={[styles.scoreCircle, { borderColor: colors.brandPrimary, backgroundColor: colors.brandTertiary }]}>
            <Text style={[styles.scorePct, { color: colors.brandPrimary, fontFamily: fonts.serifBold }]}>
              %{score}
            </Text>
            <Text style={[styles.scoreCaption, { color: colors.onBrandTertiary, fontFamily: fonts.sansMed }]}>
              {TR.quiz.percent}
            </Text>
          </View>
          <Text style={[styles.resultTitle, { color: colors.onSurface, fontFamily: fonts.serifBold }]}>
            {TR.quiz.resultTitle}
          </Text>
          <View style={styles.resultStats}>
            <View style={[styles.resultStat, { backgroundColor: colors.surfaceSecondary }]}>
              <Feather name="check-circle" size={22} color={colors.success} />
              <Text style={[styles.resultValue, { color: colors.onSurface, fontFamily: fonts.sansBold }]}>{correct}</Text>
              <Text style={[styles.resultLabel, { color: colors.onSurfaceSecondary, fontFamily: fonts.sans }]}>
                {TR.quiz.correctCount}
              </Text>
            </View>
            <View style={[styles.resultStat, { backgroundColor: colors.surfaceSecondary }]}>
              <Feather name="x-circle" size={22} color={colors.error} />
              <Text style={[styles.resultValue, { color: colors.onSurface, fontFamily: fonts.sansBold }]}>{wrong}</Text>
              <Text style={[styles.resultLabel, { color: colors.onSurfaceSecondary, fontFamily: fonts.sans }]}>
                {TR.quiz.wrongCount}
              </Text>
            </View>
            <View style={[styles.resultStat, { backgroundColor: colors.surfaceSecondary }]}>
              <Feather name="award" size={22} color={colors.brandSecondary} />
              <Text style={[styles.resultValue, { color: colors.onSurface, fontFamily: fonts.sansBold }]}>
                {Math.round(points)}
              </Text>
              <Text style={[styles.resultLabel, { color: colors.onSurfaceSecondary, fontFamily: fonts.sans }]}>
                {TR.quiz.points}
              </Text>
            </View>
          </View>
          <View style={styles.resultActions}>
            <PrimaryButton testID="quiz-restart" label={TR.quiz.playAgain} icon="refresh-cw" onPress={restart} fullWidth />
            <View style={{ height: 12 }} />
            <PrimaryButton
              testID="quiz-home"
              label={TR.quiz.backHome}
              variant="secondary"
              onPress={() => router.replace("/(tabs)/quiz")}
              fullWidth
            />
          </View>
        </ScrollView>
      </View>
    );
  }

  const progress = (index + (selected !== null ? 1 : 0)) / total;
  const timeFrac = timeLimit > 0 ? timeLeft / timeLimit : 0;
  const timeColor = timeLeft <= 3 ? colors.error : colors.brandSecondary;

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 6 }]}>
        <Pressable
          testID="quiz-close"
          onPress={() => router.replace("/(tabs)/quiz")}
          hitSlop={10}
          style={({ pressed }) => [styles.closeBtn, { backgroundColor: colors.surfaceSecondary, opacity: pressed ? 0.6 : 1 }]}
        >
          <Feather name="x" size={22} color={colors.onSurface} />
        </Pressable>
        <Text style={[styles.progressLabel, { color: colors.onSurfaceSecondary, fontFamily: fonts.sansSemi }]}>
          {TR.quiz.question(index + 1, total)}
        </Text>
        {timed ? (
          <View testID="quiz-timer" style={[styles.timerPill, { backgroundColor: colors.surfaceSecondary }]}>
            <Feather name="clock" size={13} color={timeColor} />
            <Text style={[styles.timerText, { color: timeColor, fontFamily: fonts.sansBold }]}>{timeLeft}</Text>
          </View>
        ) : (
          <View style={{ width: 42 }} />
        )}
      </View>

      {/* Progress bar */}
      <View style={[styles.progressTrack, { backgroundColor: colors.surfaceTertiary }]}>
        <View style={[styles.progressFill, { width: `${progress * 100}%`, backgroundColor: colors.brandPrimary }]} />
      </View>

      {/* Time bar */}
      {timed && (
        <View style={[styles.timeTrack, { backgroundColor: colors.surfaceTertiary }]}>
          <View style={[styles.timeFill, { width: `${timeFrac * 100}%`, backgroundColor: timeColor }]} />
        </View>
      )}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: 140 }}
      >
        <Text style={[styles.modeTag, { color: colors.brandPrimary, fontFamily: fonts.sansBold }]}>
          {TR.quiz.modes[quizMode].title} • {difficulty === "easy" ? TR.quiz.easy : difficulty === "hard" ? TR.quiz.hard : TR.quiz.medium}
        </Text>
        <View style={[styles.questionCard, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
          <Text style={[styles.question, { color: colors.onSurface, fontFamily: proverbFont, fontSize: type(24) }]}>
            {q.prompt}
          </Text>
        </View>

        <View style={{ gap: 12, marginTop: 20 }}>
          {q.options.map((opt, i) => {
            const answered = selected !== null;
            const isAnswer = i === q.answerIndex;
            const isSelected = i === selected;
            let bg = colors.surfaceSecondary;
            let border = colors.border;
            let icon: string | null = null;
            let iconColor = colors.onSurface;
            if (answered) {
              if (isAnswer) {
                bg = colors.brandTertiary;
                border = colors.success;
                icon = "check-circle";
                iconColor = colors.success;
              } else if (isSelected) {
                border = colors.error;
                icon = "x-circle";
                iconColor = colors.error;
              }
            }
            return (
              <Pressable
                key={i}
                testID={`quiz-option-${i}`}
                disabled={answered}
                onPress={() => onSelect(i)}
                style={({ pressed }) => [
                  styles.option,
                  { backgroundColor: bg, borderColor: border, opacity: pressed ? 0.85 : 1 },
                ]}
              >
                <Text
                  style={[styles.optionText, { color: colors.onSurface, fontFamily: fonts.sansMed, fontSize: type(15) }]}
                >
                  {opt}
                </Text>
                {icon ? <Feather name={icon as any} size={20} color={iconColor} /> : null}
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      {/* Continue */}
      {selected !== null && (
        <View
          style={[
            styles.footer,
            { paddingBottom: insets.bottom + 12, backgroundColor: colors.surface, borderTopColor: colors.divider },
          ]}
        >
          <Text
            style={[
              styles.feedback,
              {
                color: selected === q.answerIndex ? colors.success : colors.error,
                fontFamily: fonts.sansBold,
              },
            ]}
          >
            {selected === q.answerIndex
              ? TR.quiz.correct
              : `${selected === -1 ? TR.quiz.timeUp : TR.quiz.wrong} • ${TR.quiz.correctAnswer}: ${q.options[q.answerIndex]}`}
          </Text>
          <PrimaryButton
            testID="quiz-next"
            label={index + 1 >= total ? TR.quiz.finish : TR.quiz.next}
            icon="arrow-right"
            onPress={next}
            fullWidth
          />
        </View>
      )}
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
    paddingBottom: 8,
  },
  closeBtn: { width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center" },
  progressLabel: { fontSize: 14 },
  timerPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    minWidth: 42,
    justifyContent: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  timerText: { fontSize: 14 },
  progressTrack: { height: 6, marginHorizontal: 16, borderRadius: 3, overflow: "hidden" },
  progressFill: { height: 6, borderRadius: 3 },
  timeTrack: { height: 4, marginHorizontal: 16, borderRadius: 2, overflow: "hidden", marginTop: 6 },
  timeFill: { height: 4, borderRadius: 2 },
  modeTag: { fontSize: 12, letterSpacing: 0.6, textTransform: "uppercase", marginBottom: 10, marginTop: 6 },
  questionCard: { borderRadius: 20, borderWidth: 1, padding: 22, minHeight: 120, justifyContent: "center" },
  question: { lineHeight: 34, textAlign: "center" },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 16,
    minHeight: 56,
  },
  optionText: { flex: 1, lineHeight: 22 },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  feedback: { fontSize: 14, marginBottom: 10, textAlign: "center" },

  resultWrap: { padding: 24, alignItems: "center", justifyContent: "center", flexGrow: 1 },
  scoreCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 4,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  scorePct: { fontSize: 48, lineHeight: 54 },
  scoreCaption: { fontSize: 13 },
  resultTitle: { fontSize: 28, marginBottom: 24 },
  resultStats: { flexDirection: "row", gap: 12, width: "100%", marginBottom: 32 },
  resultStat: { flex: 1, alignItems: "center", borderRadius: 16, paddingVertical: 18, gap: 6 },
  resultValue: { fontSize: 22 },
  resultLabel: { fontSize: 11 },
  resultActions: { width: "100%" },
});
