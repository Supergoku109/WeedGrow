import React from 'react';
import { StyleSheet, TouchableOpacity, Image, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useRouter } from 'expo-router';

import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Plant } from '@/firestoreModels';
import { Colors, calendarGreen } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { ProgressBar } from 'react-native-paper';

export interface PlantCardProps {
  plant: Plant & { id: string };
}

export function PlantCard({ plant }: PlantCardProps) {
  const router = useRouter();
  type Theme = keyof typeof Colors;
  const theme = (useColorScheme() ?? 'dark') as Theme;

  const createdDate =
    'toDate' in plant.createdAt ? plant.createdAt.toDate() : (plant.createdAt as any);
  const diffMs = Date.now() - new Date(createdDate).getTime();
  const ageDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const ageLabel = `${ageDays} day${ageDays === 1 ? '' : 's'} old`;

  const waterLevel = typeof (plant as any).waterLevel === 'number' ? (plant as any).waterLevel : 0;

  return (
    <TouchableOpacity
      onPress={() => router.push({ pathname: '/plant/[id]', params: { id: plant.id } })}
    >
      <ThemedView style={[styles.card, { backgroundColor: calendarGreen }]}>
        <View style={styles.row}>
          {plant.imageUri && (
            <Animated.View
              sharedTransitionTag={`plant.${plant.id}.photo`}
              style={styles.imageWrap}
            >
              <Image source={{ uri: plant.imageUri }} style={styles.image} />
            </Animated.View>
          )}

          <View style={styles.textContainer}>
            <ThemedText type="subtitle">{plant.name}</ThemedText>
            <ThemedText>{plant.strain}</ThemedText>
            <ThemedText>{ageLabel}</ThemedText>
            <ProgressBar progress={waterLevel} style={styles.progressBar} color={Colors[theme].tint} />
          </View>
        </View>
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
  row: {
    flexDirection: 'row',
    alignItems: 'center', // Center the image vertically with the text
  },
  imageWrap: {
    marginRight: 12,
    borderRadius: 8,
    overflow: 'hidden',
  },
  image: {
    height: 100,
    width: 100,
    borderRadius: 8,
  },
  textContainer: {
    flex: 1,
    gap: 4,
  },
  progressBar: {
    marginTop: 4,
    height: 8,
    borderRadius: 4,
  },
});
