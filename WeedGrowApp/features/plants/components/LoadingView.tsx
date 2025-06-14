import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import { ThemedView } from '@/ui/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function LoadingView() {
  const theme = (useColorScheme() ?? 'dark') as keyof typeof Colors;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors[theme].background }}>
      <ThemedView style={styles.center}>
        <ActivityIndicator color={Colors[theme].tint} />
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
