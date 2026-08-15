import { Feather } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import * as Haptics from "expo-haptics";
import React from "react";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTheme } from "@/src/context/ThemeContext";
import { useI18n } from "@/src/context/LanguageContext";

export default function TabsLayout() {
  const { colors, fonts } = useTheme();
  const { t } = useI18n();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenListeners={{
        tabPress: () => Haptics.selectionAsync(),
      }}
      screenOptions={{
        headerShown: false,

        tabBarActiveTintColor: colors.brandPrimary,
        tabBarInactiveTintColor: colors.onSurfaceTertiary,

        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.divider,
          borderTopWidth: 1,

          // Android system navigation area için güvenli boşluk
          height:
            Platform.OS === "ios"
              ? 88
              : 64 + insets.bottom,

          paddingTop: 6,

          paddingBottom:
            Platform.OS === "ios"
              ? 28
              : 8 + insets.bottom,
        },

        tabBarLabelStyle: {
          fontFamily: fonts.sansSemi,
          fontSize: 11,
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t.tabs.home,
          tabBarIcon: ({ color, size }) => (
            <Feather
              name="home"
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="browse"
        options={{
          title: t.tabs.browse,
          tabBarIcon: ({ color, size }) => (
            <Feather
              name="book-open"
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="categories"
        options={{
          title: t.tabs.categories,
          tabBarIcon: ({ color, size }) => (
            <Feather
              name="grid"
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="quiz"
        options={{
          title: t.tabs.quiz,
          tabBarIcon: ({ color, size }) => (
            <Feather
              name="help-circle"
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="favorites"
        options={{
          title: t.tabs.favorites,
          tabBarIcon: ({ color, size }) => (
            <Feather
              name="heart"
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}