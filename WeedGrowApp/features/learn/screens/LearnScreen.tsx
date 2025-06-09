import React from 'react';
import { ThemedView } from '@/ui/ThemedView';
import { ThemedText } from '@/ui/ThemedText';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function LearnScreen() {
  const insets = useSafeAreaInsets();
  return (
    <ThemedView style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: insets.top }}>
      <ThemedText type="title">Learn</ThemedText>
      <ThemedText>Coming soon...</ThemedText>
    </ThemedView>
  );
}
