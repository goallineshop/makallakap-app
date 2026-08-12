// Local daily "Günün Atasözü" reminder using on-device notifications.
//
// This uses expo-notifications LOCAL scheduling only (no server, no push keys,
// no google-services.json). Local notifications do NOT fire in Expo Go (SDK 53+)
// or on web — they work in a real development/production build. All calls are
// guarded so the app never crashes in unsupported environments; the user's
// preference is always saved and re-applied on the next launch.

import { Platform } from 'react-native';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';

import { storage } from '@/src/utils/storage';
import { proverbOfDay } from '@/src/services/proverbs';

export type NotifSettings = {
  enabled: boolean;
  hour: number;
  minute: number;
};

export type PermResult = 'granted' | 'denied' | 'unavailable';

export const DEFAULT_NOTIF: NotifSettings = { enabled: false, hour: 9, minute: 0 };

// Localized notification title (proverb body itself is never translated).
const NOTIF_TITLES: Record<string, string> = {
  tr: 'Günün Atasözü',
  en: 'Proverb of the Day',
  de: 'Sprichwort des Tages',
  ru: 'Пословица дня',
};
async function getNotifTitle(): Promise<string> {
  const lang = await storage.getItem<string>('mk_lang', 'tr');
  return NOTIF_TITLES[lang || 'tr'] || NOTIF_TITLES.tr;
}

const isExpoGo = Constants.appOwnership === 'expo';

export function isNotificationsSupported(): boolean {
  return Platform.OS !== 'web' && !isExpoGo;
}

// Foreground presentation (SDK 54 keys).
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export function formatTime(hour: number, minute: number): string {
  const h = hour.toString().padStart(2, '0');
  const m = minute.toString().padStart(2, '0');
  return `${h}:${m}`;
}

export function previewNotificationBody(): string {
  const p = proverbOfDay();
  return `Bugünün Atasözü: ${p.proverb}`;
}

export async function requestNotificationPermission(): Promise<PermResult> {
  if (!isNotificationsSupported()) return 'unavailable';
  try {
    const current = await Notifications.getPermissionsAsync();
    if (current.granted) return 'granted';
    const req = await Notifications.requestPermissionsAsync();
    return req.granted ? 'granted' : 'denied';
  } catch {
    return 'unavailable';
  }
}

async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  try {
    await Notifications.setNotificationChannelAsync('daily-proverb', {
      name: 'Günün Atasözü',
      importance: Notifications.AndroidImportance.DEFAULT,
      lightColor: '#8C2128',
    });
  } catch {
    /* noop */
  }
}

export async function cancelAll(): Promise<void> {
  if (!isNotificationsSupported()) return;
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch {
    /* noop */
  }
}

export async function scheduleDaily(hour: number, minute: number): Promise<void> {
  if (!isNotificationsSupported()) return;
  try {
    await ensureAndroidChannel();
    await Notifications.cancelAllScheduledNotificationsAsync();
    const p = proverbOfDay();
    const title = await getNotifTitle();
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body: p.proverb,
        data: { proverbId: p.id },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
        channelId: 'daily-proverb',
      },
    });
  } catch {
    /* noop */
  }
}

// Single entry point called whenever notification settings change or on launch.
export async function applySchedule(settings: NotifSettings): Promise<void> {
  if (!settings.enabled) {
    await cancelAll();
    return;
  }
  await scheduleDaily(settings.hour, settings.minute);
}
