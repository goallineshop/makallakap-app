import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { storage } from '@/src/utils/storage';
import {
  AchievementState,
  evaluateAchievements,
} from '@/src/services/achievements';
import { applySchedule, DEFAULT_NOTIF, NotifSettings } from '@/src/services/notifications';

const KEY_FAV = 'mk_favorites';
const KEY_RECENT = 'mk_recent';
const KEY_STREAK = 'mk_streak';
const KEY_QUIZ = 'mk_quizstats';
const KEY_NOTIF = 'mk_notif';

const RECENT_LIMIT = 50;

export type StreakData = { current: number; longest: number; lastActive: string };
export type QuizStats = { games: number; totalCorrect: number; totalWrong: number; bestScore: number };

const DEFAULT_STREAK: StreakData = { current: 0, longest: 0, lastActive: '' };
const DEFAULT_QUIZ: QuizStats = { games: 0, totalCorrect: 0, totalWrong: 0, bestScore: 0 };

function dayKey(d = new Date()): string {
  return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d
    .getDate()
    .toString()
    .padStart(2, '0')}`;
}

function daysBetween(a: string, b: string): number {
  const [ay, am, ad] = a.split('-').map(Number);
  const [by, bm, bd] = b.split('-').map(Number);
  const da = Date.UTC(ay, am - 1, ad);
  const db = Date.UTC(by, bm - 1, bd);
  return Math.round((db - da) / 86400000);
}

type UserDataValue = {
  ready: boolean;
  favorites: string[];
  isFavorite: (id: string) => boolean;
  toggleFavorite: (id: string) => boolean; // returns new favorite state
  recent: string[];
  addRecent: (id: string) => void;
  clearRecent: () => void;
  streak: StreakData;
  quizStats: QuizStats;
  recordQuizResult: (correct: number, wrong: number, score: number) => void;
  achievements: AchievementState[];
  notif: NotifSettings;
  setNotif: (partial: Partial<NotifSettings>) => void;
};

const UserDataContext = createContext<UserDataValue | undefined>(undefined);

export function UserDataProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recent, setRecent] = useState<string[]>([]);
  const [streak, setStreak] = useState<StreakData>(DEFAULT_STREAK);
  const [quizStats, setQuizStats] = useState<QuizStats>(DEFAULT_QUIZ);
  const [notif, setNotifState] = useState<NotifSettings>(DEFAULT_NOTIF);

  useEffect(() => {
    (async () => {
      const [fav, rec, str, quiz, nt] = await Promise.all([
        storage.getItem<string[]>(KEY_FAV, []),
        storage.getItem<string[]>(KEY_RECENT, []),
        storage.getItem<StreakData>(KEY_STREAK, DEFAULT_STREAK),
        storage.getItem<QuizStats>(KEY_QUIZ, DEFAULT_QUIZ),
        storage.getItem<NotifSettings>(KEY_NOTIF, DEFAULT_NOTIF),
      ]);
      setFavorites(fav || []);
      setRecent(rec || []);
      setQuizStats(quiz || DEFAULT_QUIZ);
      setNotifState(nt || DEFAULT_NOTIF);

      // Daily streak update on app open.
      const today = dayKey();
      const cur = str || DEFAULT_STREAK;
      let next: StreakData;
      if (!cur.lastActive) {
        next = { current: 1, longest: 1, lastActive: today };
      } else {
        const diff = daysBetween(cur.lastActive, today);
        if (diff === 0) {
          next = cur;
        } else if (diff === 1) {
          const c = cur.current + 1;
          next = { current: c, longest: Math.max(c, cur.longest), lastActive: today };
        } else {
          next = { current: 1, longest: Math.max(1, cur.longest), lastActive: today };
        }
      }
      setStreak(next);
      if (JSON.stringify(next) !== JSON.stringify(cur)) storage.setItem(KEY_STREAK, next);
      setReady(true);
    })();
  }, []);

  const isFavorite = useCallback((id: string) => favorites.includes(id), [favorites]);

  const toggleFavorite = useCallback(
    (id: string) => {
      let nowFav = false;
      setFavorites((prev) => {
        let next: string[];
        if (prev.includes(id)) {
          next = prev.filter((x) => x !== id);
          nowFav = false;
        } else {
          next = [id, ...prev];
          nowFav = true;
        }
        storage.setItem(KEY_FAV, next);
        return next;
      });
      return nowFav;
    },
    [],
  );

  const addRecent = useCallback((id: string) => {
    setRecent((prev) => {
      const next = [id, ...prev.filter((x) => x !== id)].slice(0, RECENT_LIMIT);
      storage.setItem(KEY_RECENT, next);
      return next;
    });
  }, []);

  const clearRecent = useCallback(() => {
    setRecent([]);
    storage.setItem(KEY_RECENT, []);
  }, []);

  const recordQuizResult = useCallback((correct: number, wrong: number, score: number) => {
    setQuizStats((prev) => {
      const next: QuizStats = {
        games: prev.games + 1,
        totalCorrect: prev.totalCorrect + correct,
        totalWrong: prev.totalWrong + wrong,
        bestScore: Math.max(prev.bestScore, score),
      };
      storage.setItem(KEY_QUIZ, next);
      return next;
    });
  }, []);

  const setNotif = useCallback(
    (partial: Partial<NotifSettings>) => {
      setNotifState((prev) => {
        const next = { ...prev, ...partial };
        storage.setItem(KEY_NOTIF, next);
        applySchedule(next);
        return next;
      });
    },
    [],
  );

  const achievements = useMemo(
    () =>
      evaluateAchievements({
        quizGames: quizStats.games,
        totalCorrect: quizStats.totalCorrect,
        favorites: favorites.length,
        streak: streak.current,
      }),
    [quizStats.games, quizStats.totalCorrect, favorites.length, streak.current],
  );

  const value: UserDataValue = {
    ready,
    favorites,
    isFavorite,
    toggleFavorite,
    recent,
    addRecent,
    clearRecent,
    streak,
    quizStats,
    recordQuizResult,
    achievements,
    notif,
    setNotif,
  };

  return <UserDataContext.Provider value={value}>{children}</UserDataContext.Provider>;
}

export function useUserData(): UserDataValue {
  const ctx = useContext(UserDataContext);
  if (!ctx) throw new Error('useUserData must be used within UserDataProvider');
  return ctx;
}
