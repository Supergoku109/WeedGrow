import React from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Image,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { IconButton } from 'react-native-paper';
import { useRouter } from 'expo-router';

import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { calendarGreen } from '@/constants/Colors';
import type { Group, Plant } from '@/firestoreModels';

export interface GroupCardProps {
  group: Group & { id: string };
  plants?: (Plant & { id: string })[];
  weatherData?: {
    temperature?: number;
    humidity?: number;
  };
  /** Optional label like "2 days ago" */
  lastWatered?: string;
  onWaterAll?: () => void;
  onEdit?: () => void;
}

export default function GroupCard({
  group,
  plants = [],
  weatherData,
  lastWatered,
  onWaterAll,
  onEdit,
}: GroupCardProps) {
  const router = useRouter();
  const envIcon =
    group.environment === 'indoor'
      ? 'home'
      : group.environment === 'outdoor'
      ? 'weather-sunny'
      : 'greenhouse';
  return (
    <TouchableOpacity
      onPress={() =>
        router.push({ pathname: '/group/[id]', params: { id: group.id } })
      }
    >
      <ThemedView style={styles.card}>
        {onWaterAll && (
          <IconButton
            icon="water"
            size={24}
            mode="contained"
            onPress={(e) => {
              e.stopPropagation();
              onWaterAll();
            }}
            style={styles.waterButton}
            accessibilityLabel="Water all plants"
          />
        )}
        <View style={styles.row}>
          <MaterialCommunityIcons
            name={envIcon}
            size={24}
            color="white"
            style={styles.icon}
          />
          <ThemedText type="subtitle" style={styles.name}>
            {group.name}
          </ThemedText>
          {onEdit && (
            <IconButton
              icon="pencil"
              size={20}
              mode="contained"
              onPress={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              accessibilityLabel="Edit group"
            />
          )}
        </View>

        {plants.length > 0 && (
          <View style={styles.plantsRow}>
            {plants.slice(0, 3).map((p) =>
              p.imageUri ? (
                <Image
                  key={p.id}
                  source={{ uri: p.imageUri }}
                  style={styles.plantImage}
                />
              ) : (
                <View key={p.id} style={styles.plantPlaceholder}>
                  <ThemedText style={styles.plantPlaceholderText}>{p.name}</ThemedText>
                </View>
              )
            )}
            {plants.length > 3 && (
              <ThemedText style={styles.moreText}>+{plants.length - 3}</ThemedText>
            )}
          </View>
        )}

        {weatherData && (
          <View style={styles.weatherRow}>
            {weatherData.temperature !== undefined && (
              <ThemedText>🌡️ {weatherData.temperature}°</ThemedText>
            )}
            {weatherData.humidity !== undefined && (
              <ThemedText>💧 {weatherData.humidity}%</ThemedText>
            )}
          </View>
        )}

        {lastWatered && (
          <ThemedText style={styles.lastWatered}>Last watered {lastWatered}</ThemedText>
        )}
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
    position: 'relative',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  icon: {
    marginRight: 8,
  },
  name: {
    flex: 1,
  },
  plantsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  plantImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 4,
  },
  plantPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ccc',
  },
  plantPlaceholderText: {
    fontSize: 10,
    textAlign: 'center',
  },
  moreText: {
    marginLeft: 4,
  },
  weatherRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 8,
  },
  lastWatered: {
    marginTop: 4,
  },
  waterButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    zIndex: 5,
  },
});
