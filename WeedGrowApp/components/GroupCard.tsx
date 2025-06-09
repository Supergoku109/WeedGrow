import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { calendarGreen } from '@/constants/Colors';
import type { Group } from '@/firestoreModels';

export interface GroupCardProps {
  group: Group & { id: string };
}

export default function GroupCard({ group }: GroupCardProps) {
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
        </View>
        <ThemedText>
          {group.plantIds.length} {group.plantIds.length === 1 ? 'plant' : 'plants'}
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
    backgroundColor: calendarGreen,
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
});
