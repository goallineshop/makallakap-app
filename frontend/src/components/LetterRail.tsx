import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/src/context/ThemeContext';

export function LetterRail({
  letters,
  active,
  onSelect,
}: {
  letters: string[];
  active?: string;
  onSelect: (letter: string) => void;
}) {
  const { colors, fonts } = useTheme();
  return (
    <View style={styles.wrap} pointerEvents="box-none">
      <View style={[styles.rail, { backgroundColor: colors.surfaceSecondary }]}>
        {letters.map((l) => {
          const isActive = l === active;
          return (
            <Pressable
              key={l}
              testID={`letter-${l}`}
              onPress={() => onSelect(l)}
              hitSlop={4}
              style={styles.item}
            >
              <Text
                style={[
                  styles.letter,
                  {
                    color: isActive ? colors.brandPrimary : colors.onSurfaceSecondary,
                    fontFamily: isActive ? fonts.sansBold : fonts.sansMed,
                  },
                ]}
              >
                {l}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    right: 2,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  rail: {
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 3,
    alignItems: 'center',
  },
  item: { paddingVertical: 1.5, paddingHorizontal: 3 },
  letter: { fontSize: 10.5, textAlign: 'center', lineHeight: 14 },
});
