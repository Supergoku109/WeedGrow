import React from 'react';
import { StyleSheet } from 'react-native';

import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Plant } from '@/firestoreModels';

export interface PlantCardProps {
  plant: Plant;
}

export function PlantCard({ plant }: PlantCardProps) {
  return (
    <ThemedView style={styles.card}>
      <ThemedText type="subtitle">{plant.name}</ThemedText>
      <ThemedText>Strain: {plant.strain}</ThemedText>
      <ThemedText>Stage: {plant.growthStage}</ThemedText>
      <ThemedText>Status: {plant.status}</ThemedText>
      <ThemedText>Environment: {plant.environment}</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#333',
    borderRadius: 8,
  },
});

