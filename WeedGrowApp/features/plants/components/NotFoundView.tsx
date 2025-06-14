import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { ThemedView } from '@/ui/ThemedView';
import { ThemedText } from '@/ui/ThemedText';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function NotFoundView() {
  const theme = (useColorScheme() ?? 'dark') as keyof typeof Colors;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors[theme].background }}>
      <ThemedView style={styles.center}>
        <ThemedText>Plant not found.</ThemedText>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
