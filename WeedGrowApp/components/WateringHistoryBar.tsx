import React from 'react';
import { View, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import type { WateringHistoryEntry } from '@/lib/logs/fetchWateringHistory';

export interface WateringHistoryBarProps {
  history: WateringHistoryEntry[];
}

export default function WateringHistoryBar({ history }: WateringHistoryBarProps) {
  const theme = (useColorScheme() ?? 'dark') as keyof typeof Colors;

  return (
    <View style={styles.container}>
      {history.map((h, idx) => {
        const date = new Date(h.date);
        const label = date.toLocaleDateString(undefined, { weekday: 'short' });
        return (
          <View key={`${h.date}-${idx}`} style={styles.day}>
            <MaterialCommunityIcons
              name="water"
              size={24}
              color={h.watered ? Colors[theme].tint : Colors[theme].gray}
              accessibilityLabel={h.watered ? `${label} watered` : `${label} not watered`}
              accessible
            />
            <ThemedText style={styles.label}>{label}</ThemedText>
          </View>
        );
      })}
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
