import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";

import { ScreenHeader } from "@/src/components/ScreenHeader";
import { useToast } from "@/src/components/Toast";
import { ThemeMode, useTheme, FontChoice } from "@/src/context/ThemeContext";
import { useUserData } from "@/src/context/UserDataContext";
import { ACCENTS, AccentKey, FONT_SCALE_LABELS } from "@/src/theme/tokens";
import { TR } from "@/src/i18n/tr";
import { PROVERB_COUNT } from "@/src/services/proverbs";
import { formatTime, requestNotificationPermission } from "@/src/services/notifications";

function SettingsGroup({ title, children }: { title: string; children: React.ReactNode }) {
  const { colors, fonts } = useTheme();
  return (
    <View style={styles.group}>
      <Text style={[styles.groupTitle, { color: colors.brandPrimary, fontFamily: fonts.sansBold }]}>{title}</Text>
      <View style={[styles.card, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
        {children}
      </View>
    </View>
  );
}

function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { key: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  const { colors, fonts } = useTheme();
  return (
    <View style={[styles.segment, { backgroundColor: colors.surfaceTertiary }]}>
      {options.map((o) => {
        const active = o.key === value;
        return (
          <Pressable
            key={o.key}
            testID={`seg-${o.key}`}
            onPress={() => {
              Haptics.selectionAsync();
              onChange(o.key);
            }}
            style={[styles.segmentItem, active && { backgroundColor: colors.brandPrimary }]}
          >
            <Text
              style={[
                styles.segmentText,
                { color: active ? colors.onBrandPrimary : colors.onSurfaceSecondary, fontFamily: active ? fonts.sansSemi : fonts.sansMed },
              ]}
              numberOfLines={1}
            >
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const {
    colors,
    fonts,
    spacing,
    mode,
    setMode,
    accent,
    setAccent,
    fontScaleKey,
    setFontScaleKey,
    fontChoice,
    setFontChoice,
    proverbFont,
  } = useTheme();
  const { notif, setNotif } = useUserData();
  const toast = useToast();

  const onToggleNotif = async (v: boolean) => {
    if (!v) {
      setNotif({ enabled: false });
      toast.show(TR.settings.notifDisabled, { icon: "bell-off", type: "info" });
      return;
    }
    const res = await requestNotificationPermission();
    if (res === "granted") {
      setNotif({ enabled: true });
      toast.show(TR.settings.notifEnabled, { icon: "bell", type: "success" });
    } else if (res === "unavailable") {
      setNotif({ enabled: true });
      toast.show(TR.settings.notifNeedsBuild, { icon: "info", type: "info" });
    } else {
      toast.show(TR.settings.notifPermDenied, { icon: "bell-off", type: "error" });
    }
  };

  const stepMinute = (delta: number) => {
    let m = notif.minute + delta;
    if (m < 0) m = 45;
    if (m > 45) m = 0;
    setNotif({ minute: m });
  };
  const stepHour = (delta: number) => {
    let h = notif.hour + delta;
    if (h < 0) h = 23;
    if (h > 23) h = 0;
    setNotif({ hour: h });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <ScreenHeader title={TR.settings.title} onBack={() => router.back()} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing["3xl"] }}
      >
        {/* Theme */}
        <SettingsGroup title={TR.settings.theme}>
          <Segmented<ThemeMode>
            options={[
              { key: "light", label: TR.settings.themeLight },
              { key: "dark", label: TR.settings.themeDark },
              { key: "system", label: TR.settings.themeSystem },
            ]}
            value={mode}
            onChange={setMode}
          />
        </SettingsGroup>

        {/* Theme color */}
        <SettingsGroup title={TR.settings.themeColor}>
          <View style={styles.swatchRow}>
            {(Object.keys(ACCENTS) as AccentKey[]).map((k) => {
              const a = ACCENTS[k];
              const active = k === accent;
              return (
                <Pressable
                  key={k}
                  testID={`accent-${k}`}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setAccent(k);
                  }}
                  style={styles.swatchWrap}
                >
                  <View
                    style={[
                      styles.swatch,
                      { backgroundColor: a.swatch, borderColor: active ? colors.onSurface : "transparent" },
                    ]}
                  >
                    {active ? <Feather name="check" size={18} color="#fff" /> : null}
                  </View>
                  <Text style={[styles.swatchLabel, { color: colors.onSurfaceSecondary, fontFamily: fonts.sansMed }]}>
                    {a.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </SettingsGroup>

        {/* Font size */}
        <SettingsGroup title={TR.settings.fontSize}>
          <Segmented
            options={FONT_SCALE_LABELS}
            value={fontScaleKey}
            onChange={setFontScaleKey}
          />
        </SettingsGroup>

        {/* Font family */}
        <SettingsGroup title={TR.settings.fontFamily}>
          <Segmented<FontChoice>
            options={[
              { key: "serif", label: TR.settings.fontSerif },
              { key: "sans", label: TR.settings.fontSans },
            ]}
            value={fontChoice}
            onChange={setFontChoice}
          />
          <View style={[styles.preview, { borderTopColor: colors.border }]}>
            <Text style={[styles.previewLabel, { color: colors.onSurfaceTertiary, fontFamily: fonts.sans }]}>
              {TR.settings.preview}
            </Text>
            <Text style={[styles.previewText, { color: colors.onSurface, fontFamily: proverbFont }]}>
              Damlaya damlaya göl olur.
            </Text>
          </View>
        </SettingsGroup>

        {/* Notifications */}
        <SettingsGroup title={TR.settings.notifications}>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Feather name="bell" size={18} color={colors.onSurface} />
              <Text style={[styles.rowLabel, { color: colors.onSurface, fontFamily: fonts.sansMed }]}>
                {TR.settings.notifDaily}
              </Text>
            </View>
            <Switch
              testID="notif-switch"
              value={notif.enabled}
              onValueChange={onToggleNotif}
              trackColor={{ false: colors.surfaceTertiary, true: colors.brandPrimary }}
              thumbColor="#fff"
            />
          </View>
          {notif.enabled && (
            <View style={[styles.row, { borderTopColor: colors.border, borderTopWidth: StyleSheet.hairlineWidth }]}>
              <View style={styles.rowLeft}>
                <Feather name="clock" size={18} color={colors.onSurface} />
                <Text style={[styles.rowLabel, { color: colors.onSurface, fontFamily: fonts.sansMed }]}>
                  {TR.settings.notifTime}
                </Text>
              </View>
              <View style={styles.timeControls}>
                <Stepper testID="hour-down" onPress={() => stepHour(-1)} icon="minus" />
                <Text style={[styles.timeText, { color: colors.onSurface, fontFamily: fonts.sansBold }]}>
                  {formatTime(notif.hour, notif.minute)}
                </Text>
                <Stepper testID="hour-up" onPress={() => stepHour(1)} icon="plus" />
                <View style={{ width: 6 }} />
                <Stepper testID="min-down" onPress={() => stepMinute(-15)} icon="chevron-down" />
                <Stepper testID="min-up" onPress={() => stepMinute(15)} icon="chevron-up" />
              </View>
            </View>
          )}
          <Text style={[styles.note, { color: colors.onSurfaceTertiary, fontFamily: fonts.sans }]}>
            {TR.settings.notifNote}
          </Text>
        </SettingsGroup>

        {/* Language */}
        <SettingsGroup title={TR.settings.language}>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Feather name="globe" size={18} color={colors.onSurface} />
              <Text style={[styles.rowLabel, { color: colors.onSurface, fontFamily: fonts.sansMed }]}>
                {TR.settings.language}
              </Text>
            </View>
            <View style={[styles.pill, { backgroundColor: colors.brandTertiary }]}>
              <Text style={[styles.pillText, { color: colors.onBrandTertiary, fontFamily: fonts.sansSemi }]}>
                {TR.settings.languageValue}
              </Text>
            </View>
          </View>
          <Text style={[styles.note, { color: colors.onSurfaceTertiary, fontFamily: fonts.sans }]}>
            {TR.settings.languageNote}
          </Text>
        </SettingsGroup>

        {/* About */}
        <SettingsGroup title={TR.settings.about}>
          <Text style={[styles.aboutText, { color: colors.onSurfaceSecondary, fontFamily: fonts.sans }]}>
            {TR.settings.aboutText}
          </Text>
          <View style={[styles.dataRow, { borderTopColor: colors.border }]}>
            <Feather name="database" size={16} color={colors.brandPrimary} />
            <Text style={[styles.dataText, { color: colors.onSurface, fontFamily: fonts.sansMed }]}>
              {TR.settings.proverbCount(PROVERB_COUNT)}
            </Text>
          </View>
        </SettingsGroup>
      </ScrollView>
    </View>
  );
}

function Stepper({ onPress, icon, testID }: { onPress: () => void; icon: string; testID?: string }) {
  const { colors } = useTheme();
  return (
    <Pressable
      testID={testID}
      onPress={() => {
        Haptics.selectionAsync();
        onPress();
      }}
      style={({ pressed }) => [styles.stepper, { backgroundColor: colors.surfaceTertiary, opacity: pressed ? 0.6 : 1 }]}
    >
      <Feather name={icon as any} size={16} color={colors.onSurface} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  group: { marginBottom: 22 },
  groupTitle: { fontSize: 12, letterSpacing: 0.6, textTransform: "uppercase", marginBottom: 10, marginLeft: 4 },
  card: { borderRadius: 16, borderWidth: 1, padding: 14 },
  segment: { flexDirection: "row", borderRadius: 12, padding: 4, gap: 4 },
  segmentItem: { flex: 1, paddingVertical: 9, borderRadius: 9, alignItems: "center" },
  segmentText: { fontSize: 12.5 },
  swatchRow: { flexDirection: "row", justifyContent: "space-between" },
  swatchWrap: { alignItems: "center", gap: 6 },
  swatch: { width: 52, height: 52, borderRadius: 26, borderWidth: 3, alignItems: "center", justifyContent: "center" },
  swatchLabel: { fontSize: 12 },
  preview: { marginTop: 14, paddingTop: 14, borderTopWidth: StyleSheet.hairlineWidth },
  previewLabel: { fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 },
  previewText: { fontSize: 22 },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 12 },
  rowLeft: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  rowLabel: { fontSize: 14, flexShrink: 1 },
  timeControls: { flexDirection: "row", alignItems: "center", gap: 6 },
  timeText: { fontSize: 15, minWidth: 52, textAlign: "center" },
  stepper: { width: 32, height: 32, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  note: { fontSize: 12, lineHeight: 17, marginTop: 8 },
  pill: { borderRadius: 999, paddingHorizontal: 12, paddingVertical: 5 },
  pillText: { fontSize: 13 },
  aboutText: { fontSize: 13, lineHeight: 20 },
  dataRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  dataText: { fontSize: 13 },
});
