import React from 'react';
import { StyleSheet, TouchableOpacity, Image } from 'react-native';
import Animated from 'react-native-reanimated';
import { useRouter } from 'expo-router';

import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Plant } from '@/firestoreModels';

export interface PlantCardProps {
  plant: Plant & { id: string };
}

export function PlantCard({ plant }: PlantCardProps) {
  const router = useRouter();
  return (
    <TouchableOpacity
      onPress={() => router.push({ pathname: '/plant/[id]', params: { id: plant.id } })}
    >
      <ThemedView style={styles.card}>
        {plant.imageUri && (
          <Animated.View
            sharedTransitionTag={`plant.${plant.id}.photo`}
            style={styles.imageWrap}
          >
            <Image source={{ uri: plant.imageUri }} style={styles.image} />
          </Animated.View>
        )}
        <ThemedText type="subtitle">{plant.name}</ThemedText>
        <ThemedText>Strain: {plant.strain}</ThemedText>
        <ThemedText><MaterialCommunityIcons name="sprout" size={16} color="#aaa" /> {plant.growthStage}</ThemedText>
        <ThemedText><MaterialCommunityIcons name={plant.status === "active" ? "check-circle-outline" : plant.status === "archived" ? "archive" : plant.status === "harvested" ? "flower" : "skull"} size={16} color="#aaa" /> {plant.status}</ThemedText>
        <ThemedText><MaterialCommunityIcons name={plant.environment === "indoor" ? "home" : plant.environment === "greenhouse" ? "greenhouse" : "tree"} size={16} color="#aaa" /> {plant.environment}</ThemedText>
      </ThemedView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#333',
    borderRadius: 8,
  },
  imageWrap: {
    marginBottom: 8,
    borderRadius: 8,
    overflow: 'hidden',
    alignSelf: 'center',
  },
  image: {
    height: 100,
    width: 100,
    borderRadius: 8,
  },
});
