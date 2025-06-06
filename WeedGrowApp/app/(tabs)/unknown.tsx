import React from 'react';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';

export default function UnknownScreen() {
  return (
    <ThemedView style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <ThemedText type="title">Unknown</ThemedText>
      <ThemedText>Coming soon...</ThemedText>
    </ThemedView>
  );
}
