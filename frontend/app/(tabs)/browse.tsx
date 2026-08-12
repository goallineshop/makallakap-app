import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { EmptyState } from "@/src/components/EmptyState";
import { LetterRail } from "@/src/components/LetterRail";
import { ProverbListItem } from "@/src/components/ProverbListItem";
import { useTheme } from "@/src/context/ThemeContext";
import { useI18n } from "@/src/context/LanguageContext";
import {
  LETTER_INDEX,
  LETTERS,
  Proverb,
  PROVERBS,
  search,
} from "@/src/services/proverbs";

export default function BrowseScreen() {
  const { colors, fonts, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const listRef = useRef<FlatList<Proverb>>(null);
  const { t } = useI18n();

  const [query, setQuery] = useState("");
  const [activeLetter, setActiveLetter] = useState<string>(LETTERS[0]?.letter ?? "A");

  const searching = query.trim().length > 0;
  const data = useMemo<Proverb[]>(() => (searching ? search(query) : PROVERBS), [query, searching]);

  const letterList = useMemo(() => LETTERS.map((l) => l.letter), []);

  const jumpToLetter = useCallback((letter: string) => {
    setActiveLetter(letter);
    const idx = LETTER_INDEX[letter];
    if (idx !== undefined && listRef.current) {
      listRef.current.scrollToIndex({ index: idx, animated: false, viewPosition: 0 });
    }
  }, []);

  const onViewable = useRef(({ viewableItems }: any) => {
    if (viewableItems && viewableItems.length > 0) {
      const first = viewableItems[0].item as Proverb;
      if (first?.firstLetter) setActiveLetter(first.firstLetter);
    }
  }).current;

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 50 }).current;

  const renderItem = useCallback(
    ({ item }: { item: Proverb }) => (
      <ProverbListItem proverb={item} onPress={() => router.push(`/proverb/${item.id}`)} />
    ),
    [router],
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      {/* Sticky header + search */}
      <View
        style={[
          styles.header,
          { paddingTop: insets.top + 8, backgroundColor: colors.surface, borderBottomColor: colors.divider },
        ]}
      >
        <Text style={[styles.title, { color: colors.onSurface, fontFamily: fonts.serifBold }]}>
          {t.browse.title}
        </Text>
        <View style={[styles.searchBox, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
          <Feather name="search" size={18} color={colors.onSurfaceTertiary} />
          <TextInput
            testID="search-input"
            value={query}
            onChangeText={setQuery}
            placeholder={t.browse.searchPlaceholder}
            placeholderTextColor={colors.onSurfaceTertiary}
            style={[styles.searchInput, { color: colors.onSurface, fontFamily: fonts.sans }]}
            autoCorrect={false}
            returnKeyType="search"
          />
          {searching ? (
            <Pressable testID="search-clear" onPress={() => setQuery("")} hitSlop={10}>
              <Feather name="x-circle" size={18} color={colors.onSurfaceTertiary} />
            </Pressable>
          ) : null}
        </View>
        <Text style={[styles.count, { color: colors.onSurfaceSecondary, fontFamily: fonts.sansMed }]}>
          {t.browse.resultsCount(data.length)}
        </Text>
      </View>

      {data.length === 0 ? (
        <EmptyState
          title={t.browse.empty}
          hint={t.browse.emptyHint}
          actionLabel={t.browse.clearSearch}
          onAction={() => setQuery("")}
        />
      ) : (
        <View style={{ flex: 1 }}>
          <FlatList
            ref={listRef}
            testID="proverbs-list"
            data={data}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            initialNumToRender={15}
            maxToRenderPerBatch={20}
            windowSize={11}
            removeClippedSubviews
            onViewableItemsChanged={onViewable}
            viewabilityConfig={viewabilityConfig}
            onScrollToIndexFailed={(info) => {
              listRef.current?.scrollToOffset({
                offset: info.averageItemLength * info.index,
                animated: false,
              });
              setTimeout(() => {
                listRef.current?.scrollToIndex({ index: info.index, animated: false });
              }, 60);
            }}
            contentContainerStyle={{ paddingBottom: spacing["3xl"], paddingRight: searching ? 0 : 22 }}
          />
          {!searching && (
            <LetterRail letters={letterList} active={activeLetter} onSelect={jumpToLetter} />
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  title: { fontSize: 26, marginBottom: 12 },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    height: 46,
  },
  searchInput: { flex: 1, fontSize: 15, padding: 0 },
  count: { fontSize: 12, marginTop: 8 },
});
