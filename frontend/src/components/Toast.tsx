import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/src/context/ThemeContext';

type ToastType = 'success' | 'error' | 'info';
type ToastState = { message: string; icon?: string; type: ToastType } | null;

type ToastValue = { show: (message: string, opts?: { icon?: string; type?: ToastType }) => void };

const ToastContext = createContext<ToastValue | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastState>(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-20)).current;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { colors, fonts, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  const show = useCallback(
    (message: string, opts?: { icon?: string; type?: ToastType }) => {
      if (timer.current) clearTimeout(timer.current);
      setToast({ message, icon: opts?.icon, type: opts?.type ?? 'success' });
      opacity.setValue(0);
      translateY.setValue(-20);
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 220, useNativeDriver: true }),
        Animated.spring(translateY, { toValue: 0, useNativeDriver: true, friction: 8 }),
      ]).start();
      timer.current = setTimeout(() => {
        Animated.parallel([
          Animated.timing(opacity, { toValue: 0, duration: 220, useNativeDriver: true }),
          Animated.timing(translateY, { toValue: -20, duration: 220, useNativeDriver: true }),
        ]).start(() => setToast(null));
      }, 1900);
    },
    [opacity, translateY],
  );

  const accentColor =
    toast?.type === 'error' ? colors.error : toast?.type === 'info' ? colors.info : colors.success;

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      {toast && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.wrap,
            { top: insets.top + 8, opacity, transform: [{ translateY }] },
          ]}
        >
          <View
            style={[
              styles.toast,
              {
                backgroundColor: isDark ? colors.surfaceSecondary : colors.surfaceInverse,
                borderColor: accentColor,
              },
            ]}
          >
            <Feather name={(toast.icon as any) ?? 'check'} size={16} color={accentColor} />
            <Text
              style={[
                styles.text,
                { color: isDark ? colors.onSurface : colors.onSurfaceInverse, fontFamily: fonts.sansMed },
              ]}
              numberOfLines={2}
            >
              {toast.message}
            </Text>
          </View>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1000,
    paddingHorizontal: 24,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 999,
    borderLeftWidth: 3,
    maxWidth: '100%',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  text: { fontSize: 13, flexShrink: 1 },
});
