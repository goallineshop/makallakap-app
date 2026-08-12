import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import { FlatList, Pressable, StyleSheet, View } from "react-native";

import { EmptyState } from "@/src/components/EmptyState";
import { ProverbListItem } from "@/src/components/ProverbListItem";
import { ScreenHeader } from "@/src/components/ScreenHeader";
import { useToast } from "@/src/components/Toast";
import { useTheme } from "@/src/context/ThemeContext";
import { useUserData } from "@/src/context/UserDataContext";
import { TR } from "@/src/i18n/tr";
import { getById, Proverb } from "@/src/services/proverbs";

export default function RecentScreen() {
  const { colors, spacing } = useTheme();
  const router = useRouter();
  const toast = useToast();
  const { recent, clearRecent } = useUserData();

  const data = useMemo(
    () => recent.map((id) => getById(id)).filter(Boolean) as Proverb[],
    [recent],
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <ScreenHeader
        title={TR.recent.title}
        onBack={() => router.back()}
        right={
          data.length > 0 ? (
            <Pressable
              testID="recent-clear-button"
              onPress={() => {
                clearRecent();
                toast.show(TR.recent.cleared, { icon: "trash-2", type: "info" });
              }}
              hitSlop={10}
            >
              <Feather name="trash-2" size={20} color={colors.brandPrimary} />
            </Pressable>
          ) : undefined
        }
      />
      {data.length === 0 ? (
        <EmptyState
          title={TR.recent.empty}
          hint={TR.recent.emptyHint}
          actionLabel={TR.browse.title}
          onAction={() => router.push("/(tabs)/browse")}
        />
      ) : (
        <FlatList
          testID="recent-list"
          data={data}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ProverbListItem proverb={item} onPress={() => router.push(`/proverb/${item.id}`)} />
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: spacing["3xl"] }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
