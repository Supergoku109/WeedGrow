import React from 'react';
import { StyleSheet, TouchableOpacity, Image, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Plant } from '@/firestoreModels';
import { Colors, calendarGreen } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getPlantAdvice, PlantAdviceContext } from '@/lib/weather/getPlantAdvice';

export interface PlantCardProps {
  plant: Plant & { id: string };
  weather?: Partial<PlantAdviceContext>;
}

const DAY_MS = 1000 * 60 * 60 * 24;

export function PlantCard({ plant, weather }: PlantCardProps) {
  const router = useRouter();
  type Theme = keyof typeof Colors;
  const theme = (useColorScheme() ?? 'dark') as Theme;

  const freq = (() => {
    const f = plant.wateringFrequency;
    if (!f) return 3;
    if (typeof f === 'number') return f;
    const match = String(f).match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 3;
  })();

  const last = plant.lastWateredAt
    ? new Date(plant.lastWateredAt)
    : plant.createdAt
      ? new Date(plant.createdAt)
      : new Date();

  const daysSince = Math.floor((Date.now() - last.getTime()) / DAY_MS);

  const ctx: PlantAdviceContext = {
    daysSinceWatered: daysSince,
    frequency: freq,
    rainToday: weather?.rainToday ?? false,
    rainTomorrow: weather?.rainTomorrow ?? false,
    rainYesterday: weather?.rainYesterday ?? 0,
    humidity: weather?.humidity ?? 50,
    dewPoint: weather?.dewPoint ?? 10,
    cloudCoverage: weather?.cloudCoverage ?? 40,
    windGust: weather?.windGust ?? 10,
    pop: weather?.pop ?? 0.2,
  };

  const advice = getPlantAdvice(ctx);

  const getSuggestionColor = () => {
    if (advice.includes('mildew')) return '#DC2626'; // red
    if (advice.includes('Rain')) return '#9CA3AF'; // gray
    if (advice.includes('lightly')) return '#FACC15'; // yellow
    if (advice.includes('water')) return '#3B82F6'; // blue
    return '#4B5563'; // default
  };

  const getBorderColor = () => {
    if (advice.includes('water your plant today')) return 'red';
    if (advice.includes('Water lightly')) return 'yellow';
    return 'transparent';
  };

  const suggestionColor = getSuggestionColor();
  const borderColor = getBorderColor();

  const envIcon = {
    indoor: 'home',
    outdoor: 'weather-sunny',
    greenhouse: 'greenhouse',
  }[(plant as any).environment ?? 'indoor'];

  return (
    <TouchableOpacity
      onPress={() => router.push({ pathname: '/plant/[id]', params: { id: plant.id } })}
    >
      <ThemedView style={[styles.card, { borderLeftColor: borderColor }]}>
        <View style={styles.row}>
          {(plant as any).imageUri && (
            <Image source={{ uri: (plant as any).imageUri }} style={styles.image} />
          )}
          <View style={styles.textContainer}>
            <ThemedText type="subtitle">{plant.name}</ThemedText>
            <ThemedText>
              {(plant as any).strain} | <MaterialCommunityIcons name={envIcon} size={14} />
            </ThemedText>
            <View style={[styles.suggestionChip, { backgroundColor: suggestionColor }]}>
              <ThemedText style={styles.suggestionText}>{advice}</ThemedText>
            </View>
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
    backgroundColor: calendarGreen,
    borderLeftWidth: 5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  image: {
    height: 80,
    width: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    gap: 6,
  },
  suggestionChip: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginTop: 4,
  },
  suggestionText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
});
