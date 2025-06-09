import React from 'react';
import { View, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import type { WeatherCacheEntry } from '@/firestoreModels';

export interface WeatherBarProps {
  /**
   * Array of weather entries for 4 consecutive days
   * starting yesterday.
   */
  data: (WeatherCacheEntry | null)[];
}

export default function WeatherBar({ data }: WeatherBarProps) {
  const theme = (useColorScheme() ?? 'dark') as keyof typeof Colors;
  const labels = ['Yesterday', 'Today', 'Tomorrow', 'Day +2'];

  return (
    <View style={styles.container}>
      {data.map((entry, idx) => (
        <View key={`${entry?.date ?? 'day'}-${idx}`} style={styles.day}>
          {entry ? (
            <MaterialCommunityIcons
              name={entry.rainfall > 0 ? 'weather-rainy' : 'weather-sunny'}
              size={24}
              color={Colors[theme].tint}
            />
          ) : (
            <MaterialCommunityIcons
              name="cloud-question"
              size={24}
              color={Colors[theme].gray}
            />
          )}
          <ThemedText style={styles.label}>
            {entry ? labels[idx] : 'No data'}
          </ThemedText>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  day: {
    alignItems: 'center',
  },
  label: {
    marginTop: 4,
  },
});
