import React from 'react';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';

export default function MoreScreen() {
  return (
    <ThemedView style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <ThemedText type="title">More</ThemedText>
      <ThemedText>Settings and more coming soon...</ThemedText>
    </ThemedView>
  );
}
