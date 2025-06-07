import React from 'react';
import { StyleSheet, TouchableOpacity, Image, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Plant } from '@/firestoreModels';
import { Colors, calendarGreen } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export interface PlantCardProps {
  plant: Plant & { id: string };
  weather?: {
    rainToday: boolean;
    rainTomorrow: boolean;
    humidity: number;
  };
}

export function PlantCard({ plant, weather }: PlantCardProps) {
  const defaultWeather = {
    rainToday: false,
    rainTomorrow: false,
    humidity: 50,
  };

  const currentWeather = weather ?? defaultWeather;
  const router = useRouter();
  type Theme = keyof typeof Colors;
  const theme = (useColorScheme() ?? 'dark') as Theme;

  const lastWateredAt = new Date((plant as any).lastWateredAt ?? 0);
  const daysSinceWatered = Math.floor((Date.now() - lastWateredAt.getTime()) / (1000 * 60 * 60 * 24));
  const frequency = (plant as any).wateringFrequency ?? 3;

  const getWateringSuggestion = () => {
    if (currentWeather.rainToday) return 'Rain Incoming';
    if (daysSinceWatered > frequency && !currentWeather.rainTomorrow) return 'Water Today';
    if (currentWeather.rainTomorrow || daysSinceWatered === frequency) return 'Water Lightly';
    return 'No Water Needed';
  };

  const getSuggestionColor = (suggestion: string) => {
    switch (suggestion) {
      case 'Water Today':
        return '#3B82F6'; // blue
      case 'Rain Incoming':
        return '#9CA3AF'; // gray
      case 'Water Lightly':
        return '#10B981'; // green
      default:
        return '#4B5563'; // dark gray
    }
  };

  const getBorderColor = (suggestion: string) => {
    switch (suggestion) {
      case 'Water Today':
        return 'red';
      case 'Water Lightly':
        return 'yellow';
      default:
        return 'transparent';
    }
  };

  const suggestion = getWateringSuggestion();
  const suggestionColor = getSuggestionColor(suggestion);
  const borderColor = getBorderColor(suggestion);

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
              <ThemedText style={styles.suggestionText}>{suggestion}</ThemedText>
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
