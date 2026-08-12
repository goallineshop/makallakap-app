// Achievement definitions + evaluation. Unlocked state is derived from user data.
export type AchievementDef = {
  id: string;
  title: string;
  desc: string;
  icon: string; // Feather icon
  metric: 'quizGames' | 'totalCorrect' | 'favorites' | 'streak';
  target: number;
};

export const ACHIEVEMENTS: AchievementDef[] = [
  { id: 'ilk_quiz', title: 'İlk Quiz', desc: 'İlk quizini tamamla', icon: 'flag', metric: 'quizGames', target: 1 },
  { id: 'dogru_10', title: '10 Doğru Cevap', desc: 'Toplam 10 doğru cevap ver', icon: 'check-circle', metric: 'totalCorrect', target: 10 },
  { id: 'dogru_50', title: '50 Doğru Cevap', desc: 'Toplam 50 doğru cevap ver', icon: 'check-circle', metric: 'totalCorrect', target: 50 },
  { id: 'dogru_100', title: '100 Doğru Cevap', desc: 'Toplam 100 doğru cevap ver', icon: 'award', metric: 'totalCorrect', target: 100 },
  { id: 'fav_10', title: '10 Favori', desc: '10 atasözünü favorile', icon: 'heart', metric: 'favorites', target: 10 },
  { id: 'fav_50', title: '50 Favori', desc: '50 atasözünü favorile', icon: 'heart', metric: 'favorites', target: 50 },
  { id: 'seri_7', title: '7 Günlük Seri', desc: '7 gün üst üste kullan', icon: 'zap', metric: 'streak', target: 7 },
  { id: 'seri_30', title: '30 Günlük Seri', desc: '30 gün üst üste kullan', icon: 'zap', metric: 'streak', target: 30 },
];

export type AchievementState = {
  def: AchievementDef;
  value: number;
  unlocked: boolean;
};

export function evaluateAchievements(input: {
  quizGames: number;
  totalCorrect: number;
  favorites: number;
  streak: number;
}): AchievementState[] {
  return ACHIEVEMENTS.map((def) => {
    const value = input[def.metric];
    return { def, value, unlocked: value >= def.target };
  });
}
