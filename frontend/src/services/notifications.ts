// Notification architecture stub.
//
// Per project scope: prepare the architecture for real daily proverb notifications
// but DO NOT wire a paid backend or require a native build to run now. This module
// stores the user's notification preference (enabled + time) and exposes a single
// scheduling entry point. When the app is later built with `expo-notifications`,
// implement `applySchedule` to schedule a repeating local notification with the
// stored time and the current "Günün Atasözü" content — no other call site changes.

import { proverbOfDay } from '@/src/services/proverbs';

export type NotifSettings = {
  enabled: boolean;
  hour: number;
  minute: number;
};

export const DEFAULT_NOTIF: NotifSettings = { enabled: false, hour: 9, minute: 0 };

export function formatTime(hour: number, minute: number): string {
  const h = hour.toString().padStart(2, '0');
  const m = minute.toString().padStart(2, '0');
  return `${h}:${m}`;
}

// Preview of the notification body using today's proverb (used in Settings UI).
export function previewNotificationBody(): string {
  const p = proverbOfDay();
  return `Bugünün Atasözü: ${p.proverb}`;
}

// Called whenever settings change. In Expo Go / preview this is a no-op that
// keeps the architecture ready; a native build overrides `applySchedule`.
export async function applySchedule(settings: NotifSettings): Promise<void> {
  // Intentionally a no-op in the current offline/Expo Go environment.
  // Real implementation (native build) would:
  //   await Notifications.cancelAllScheduledNotificationsAsync();
  //   if (settings.enabled) await Notifications.scheduleNotificationAsync({...});
  void settings;
}
