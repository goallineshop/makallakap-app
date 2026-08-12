import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';

import { storage } from '@/src/utils/storage';
import {
  ACCENTS,
  AccentKey,
  DARK,
  FONT_SCALES,
  FONTS,
  LIGHT,
  Palette,
  RADIUS,
  SPACING,
} from '@/src/theme/tokens';

export type ThemeMode = 'light' | 'dark' | 'system';
export type FontChoice = 'serif' | 'sans';

const KEY_MODE = 'mk_theme_mode';
const KEY_ACCENT = 'mk_accent';
const KEY_FONTSCALE = 'mk_fontscale';
const KEY_FONTCHOICE = 'mk_fontchoice';

type ThemeValue = {
  ready: boolean;
  mode: ThemeMode;
  isDark: boolean;
  colors: Palette;
  spacing: typeof SPACING;
  radius: typeof RADIUS;
  fonts: typeof FONTS;
  fontScaleKey: string;
  fontScale: number;
  fontChoice: FontChoice;
  proverbFont: string;
  proverbFontBold: string;
  accent: AccentKey;
  type: (size: number) => number;
  setMode: (m: ThemeMode) => void;
  setAccent: (a: AccentKey) => void;
  setFontScaleKey: (k: string) => void;
  setFontChoice: (f: FontChoice) => void;
};

const ThemeContext = createContext<ThemeValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const system = useColorScheme();
  const [ready, setReady] = useState(false);
  const [mode, setModeState] = useState<ThemeMode>('system');
  const [accent, setAccentState] = useState<AccentKey>('bordo');
  const [fontScaleKey, setFontScaleKeyState] = useState<string>('orta');
  const [fontChoice, setFontChoiceState] = useState<FontChoice>('serif');

  useEffect(() => {
    (async () => {
      const [m, a, fs, fc] = await Promise.all([
        storage.getItem<ThemeMode>(KEY_MODE, 'system'),
        storage.getItem<AccentKey>(KEY_ACCENT, 'bordo'),
        storage.getItem<string>(KEY_FONTSCALE, 'orta'),
        storage.getItem<FontChoice>(KEY_FONTCHOICE, 'serif'),
      ]);
      if (m) setModeState(m);
      if (a) setAccentState(a);
      if (fs) setFontScaleKeyState(fs);
      if (fc) setFontChoiceState(fc);
      setReady(true);
    })();
  }, []);

  const isDark = mode === 'system' ? system === 'dark' : mode === 'dark';

  const colors: Palette = useMemo(() => {
    const base = isDark ? DARK : LIGHT;
    const acc = ACCENTS[accent];
    return {
      ...base,
      brandPrimary: isDark ? acc.dark : acc.light,
      brandTertiary: isDark ? acc.tintDark : acc.tintLight,
      onBrandTertiary: isDark ? '#F5D6D8' : acc.light,
    };
  }, [isDark, accent]);

  const fontScale = FONT_SCALES[fontScaleKey] ?? 1;

  const setMode = (m: ThemeMode) => {
    setModeState(m);
    storage.setItem(KEY_MODE, m);
  };
  const setAccent = (a: AccentKey) => {
    setAccentState(a);
    storage.setItem(KEY_ACCENT, a);
  };
  const setFontScaleKey = (k: string) => {
    setFontScaleKeyState(k);
    storage.setItem(KEY_FONTSCALE, k);
  };
  const setFontChoice = (f: FontChoice) => {
    setFontChoiceState(f);
    storage.setItem(KEY_FONTCHOICE, f);
  };

  const value: ThemeValue = {
    ready,
    mode,
    isDark,
    colors,
    spacing: SPACING,
    radius: RADIUS,
    fonts: FONTS,
    fontScaleKey,
    fontScale,
    fontChoice,
    proverbFont: fontChoice === 'serif' ? FONTS.serifSemi : FONTS.sansSemi,
    proverbFontBold: fontChoice === 'serif' ? FONTS.serifBold : FONTS.sansBold,
    accent,
    type: (size: number) => Math.round(size * fontScale),
    setMode,
    setAccent,
    setFontScaleKey,
    setFontChoice,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
