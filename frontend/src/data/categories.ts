// Category metadata. Keys MUST match the `categories` values stored in proverbs.json.
// Labels are Turkish (UI). Icons use Feather where possible, MaterialCommunityIcons for animals/justice.

export type CatIconLib = 'feather' | 'mci';

export type CategoryMeta = {
  key: string;
  label: string;
  icon: string;
  lib: CatIconLib;
  color: string; // earthy accent tint used for the icon
};

export const CATEGORIES: CategoryMeta[] = [
  { key: 'Aile', label: 'Aile', icon: 'users', lib: 'feather', color: '#8C2128' },
  { key: 'Ask', label: 'Aşk', icon: 'heart', lib: 'feather', color: '#B23B5A' },
  { key: 'Arkadaslik', label: 'Arkadaşlık', icon: 'smile', lib: 'feather', color: '#B8711E' },
  { key: 'Dostluk', label: 'Dostluk', icon: 'user-check', lib: 'feather', color: '#A0522D' },
  { key: 'Dusmanlik', label: 'Düşmanlık', icon: 'alert-triangle', lib: 'feather', color: '#7A2E2E' },
  { key: 'Calisma', label: 'Çalışma', icon: 'tool', lib: 'feather', color: '#8A6D3B' },
  { key: 'Sabir', label: 'Sabır', icon: 'watch', lib: 'feather', color: '#5C7A4A' },
  { key: 'Basari', label: 'Başarı', icon: 'award', lib: 'feather', color: '#C5A059' },
  { key: 'Para', label: 'Para', icon: 'dollar-sign', lib: 'feather', color: '#2D5A4C' },
  { key: 'Zenginlik', label: 'Zenginlik', icon: 'trending-up', lib: 'feather', color: '#3C7A67' },
  { key: 'Fakirlik', label: 'Fakirlik', icon: 'trending-down', lib: 'feather', color: '#8A5A3B' },
  { key: 'Egitim', label: 'Eğitim', icon: 'book-open', lib: 'feather', color: '#4A6B8C' },
  { key: 'Akil', label: 'Akıl', icon: 'compass', lib: 'feather', color: '#6B4C8C' },
  { key: 'Zaman', label: 'Zaman', icon: 'clock', lib: 'feather', color: '#8C6A21' },
  { key: 'Hayat', label: 'Hayat', icon: 'sun', lib: 'feather', color: '#B8711E' },
  { key: 'Doga', label: 'Doğa', icon: 'feather', lib: 'feather', color: '#3C7A50' },
  { key: 'Hayvanlar', label: 'Hayvanlar', icon: 'paw', lib: 'mci', color: '#8A5A3B' },
  { key: 'Saglik', label: 'Sağlık', icon: 'activity', lib: 'feather', color: '#2D5A4C' },
  { key: 'Adalet', label: 'Adalet', icon: 'scale-balance', lib: 'mci', color: '#8C2128' },
  { key: 'Cesaret', label: 'Cesaret', icon: 'shield', lib: 'feather', color: '#A0522D' },
  { key: 'Tecrube', label: 'Tecrübe', icon: 'book', lib: 'feather', color: '#6B5637' },
  { key: 'Insan Iliskileri', label: 'İnsan İlişkileri', icon: 'message-circle', lib: 'feather', color: '#4A6B8C' },
];

export const CATEGORY_MAP: Record<string, CategoryMeta> = Object.fromEntries(
  CATEGORIES.map((c) => [c.key, c]),
);
