import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabBarBackground() {
  const colorScheme = useColorScheme();
  const theme: 'light' | 'dark' = (colorScheme === 'dark' ? 'dark' : 'light');
  return (
    <View style={[styles.tabBar, { backgroundColor: Colors[theme].background }]} />
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flex: 1,
    // Only fill the tab bar area, not the whole screen
  },
});

export function useBottomTabOverflow() {
  return 0;
}
