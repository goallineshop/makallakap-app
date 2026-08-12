import { TR, TrType } from './tr';
import { EN } from './en';
import { DE } from './de';
import { RU } from './ru';

export type Lang = 'tr' | 'en' | 'de' | 'ru';

export const STRINGS: Record<Lang, TrType> = { tr: TR, en: EN, de: DE, ru: RU };

export const LANGUAGES: { key: Lang; label: string }[] = [
  { key: 'tr', label: 'Türkçe' },
  { key: 'en', label: 'English' },
  { key: 'de', label: 'Deutsch' },
  { key: 'ru', label: 'Русский' },
];

export type { TrType };
