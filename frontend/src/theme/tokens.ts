// Design tokens for Makallakap — warm, traditional editorial theme.
// Derived from /app/design_guidelines.json. No blues/indigos/purples.

export type Palette = {
  surface: string;
  onSurface: string;
  surfaceSecondary: string;
  onSurfaceSecondary: string;
  surfaceTertiary: string;
  onSurfaceTertiary: string;
  surfaceInverse: string;
  onSurfaceInverse: string;
  brand: string;
  brandPrimary: string;
  onBrandPrimary: string;
  brandSecondary: string;
  onBrandSecondary: string;
  brandTertiary: string;
  onBrandTertiary: string;
  success: string;
  onSuccess: string;
  warning: string;
  onWarning: string;
  error: string;
  onError: string;
  info: string;
  onInfo: string;
  border: string;
  borderStrong: string;
  divider: string;
};

export const LIGHT: Palette = {
  surface: '#FDFBF7',
  onSurface: '#2C2421',
  surfaceSecondary: '#F4EFE6',
  onSurfaceSecondary: '#4A3C35',
  surfaceTertiary: '#E8DEC8',
  onSurfaceTertiary: '#59473D',
  surfaceInverse: '#2C2421',
  onSurfaceInverse: '#FDFBF7',
  brand: '#8C2128',
  brandPrimary: '#8C2128',
  onBrandPrimary: '#FFFFFF',
  brandSecondary: '#D4AF37',
  onBrandSecondary: '#1A1412',
  brandTertiary: '#E6D3C8',
  onBrandTertiary: '#5C1217',
  success: '#2D5A4C',
  onSuccess: '#FFFFFF',
  warning: '#B8711E',
  onWarning: '#FFFFFF',
  error: '#962D2D',
  onError: '#FFFFFF',
  info: '#4A6B8C',
  onInfo: '#FFFFFF',
  border: '#E8DEC8',
  borderStrong: '#C5A059',
  divider: '#E8DEC8',
};

export const DARK: Palette = {
  surface: '#1A1412',
  onSurface: '#EBE5DF',
  surfaceSecondary: '#2A1C1A',
  onSurfaceSecondary: '#D1C7C0',
  surfaceTertiary: '#3D2724',
  onSurfaceTertiary: '#E0D4CD',
  surfaceInverse: '#EBE5DF',
  onSurfaceInverse: '#1A1412',
  brand: '#8C2128',
  brandPrimary: '#B23B44',
  onBrandPrimary: '#FFFFFF',
  brandSecondary: '#E0BE55',
  onBrandSecondary: '#1A1412',
  brandTertiary: '#5C1D21',
  onBrandTertiary: '#F5D6D8',
  success: '#3C7A67',
  onSuccess: '#FFFFFF',
  warning: '#D68D31',
  onWarning: '#1A1412',
  error: '#B83D3D',
  onError: '#FFFFFF',
  info: '#668BAF',
  onInfo: '#FFFFFF',
  border: '#3D2724',
  borderStrong: '#8C7142',
  divider: '#3D2724',
};

// Accent presets — override the primary brand color while keeping earthy gold secondary.
export type AccentKey = 'bordo' | 'altin' | 'yesil' | 'bakir';

export const ACCENTS: Record<
  AccentKey,
  { label: string; swatch: string; light: string; dark: string; tintLight: string; tintDark: string }
> = {
  bordo: { label: 'Bordo', swatch: '#8C2128', light: '#8C2128', dark: '#B23B44', tintLight: '#E6D3C8', tintDark: '#5C1D21' },
  altin: { label: 'Altın', swatch: '#B8711E', light: '#B8711E', dark: '#D68D31', tintLight: '#F0E2C8', tintDark: '#4A3416' },
  yesil: { label: 'Zümrüt', swatch: '#2D5A4C', light: '#2D5A4C', dark: '#3C7A67', tintLight: '#D7E5DE', tintDark: '#1E3A31' },
  bakir: { label: 'Bakır', swatch: '#A0522D', light: '#A0522D', dark: '#C0703F', tintLight: '#EDD9CB', tintDark: '#4A2A18' },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
  '3xl': 48,
} as const;

export const RADIUS = {
  sm: 6,
  md: 12,
  lg: 20,
  pill: 999,
} as const;

export const FONTS = {
  serif: 'Cormorant',
  serifMed: 'Cormorant-Medium',
  serifSemi: 'Cormorant-SemiBold',
  serifBold: 'Cormorant-Bold',
  sans: 'Jakarta',
  sansMed: 'Jakarta-Medium',
  sansSemi: 'Jakarta-SemiBold',
  sansBold: 'Jakarta-Bold',
} as const;

export const FONT_SCALES: Record<string, number> = {
  kucuk: 0.9,
  orta: 1.0,
  buyuk: 1.15,
  cok_buyuk: 1.3,
};

export const FONT_SCALE_LABELS: { key: string; label: string }[] = [
  { key: 'kucuk', label: 'Küçük' },
  { key: 'orta', label: 'Orta' },
  { key: 'buyuk', label: 'Büyük' },
  { key: 'cok_buyuk', label: 'Çok Büyük' },
];
