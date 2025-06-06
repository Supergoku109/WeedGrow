import React from 'react';
import { StyleSheet, TouchableOpacity, Image } from 'react-native';
import Animated from 'react-native-reanimated';
import { useRouter } from 'expo-router';

import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Plant } from '@/firestoreModels';
import { Colors, calendarGreen } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export interface PlantCardProps {
  plant: Plant & { id: string };
}

export function PlantCard({ plant }: PlantCardProps) {
  const router = useRouter();
  type Theme = keyof typeof Colors;
  const theme = (useColorScheme() ?? 'dark') as Theme;
  return (
    <TouchableOpacity
      onPress={() => router.push({ pathname: '/plant/[id]', params: { id: plant.id } })}
    >
      <ThemedView
        style={[styles.card, { backgroundColor: calendarGreen }]}
      >
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
        <ThemedText>
          <MaterialCommunityIcons name="sprout" size={16} color={Colors[theme].gray} /> {plant.growthStage}
        </ThemedText>
        <ThemedText>
          <MaterialCommunityIcons
            name={
              plant.status === 'active'
                ? 'check-circle-outline'
                : plant.status === 'archived'
                  ? 'archive'
                  : plant.status === 'harvested'
                    ? 'flower'
                    : 'skull'
            }
            size={16}
            color={Colors[theme].gray}
          />{' '}
          {plant.status}
        </ThemedText>
        <ThemedText>
          <MaterialCommunityIcons
            name={
              plant.environment === 'indoor'
                ? 'home'
                : plant.environment === 'greenhouse'
                  ? 'greenhouse'
                  : 'tree'
            }
            size={16}
            color={Colors[theme].gray}
          />{' '}
          {plant.environment}
        </ThemedText>
      </ThemedView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    padding: 12,
    borderRadius: 12,
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
