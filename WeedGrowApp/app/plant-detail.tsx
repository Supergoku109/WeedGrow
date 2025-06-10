import React from 'react';
import { ThemedView } from '@/ui/ThemedView';
import { ThemedText } from '@/ui/ThemedText';

export default function PlantDetailScreen() {
  return (
    <ThemedView style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <ThemedText type="title">Plant Detail</ThemedText>
      <ThemedText>Details coming soon...</ThemedText>
    </ThemedView>
  );
}
