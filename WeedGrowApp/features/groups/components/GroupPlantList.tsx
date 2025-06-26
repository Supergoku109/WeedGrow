// GroupPlantList.tsx
// This component displays a list of plants belonging to a group.
// Each plant is shown as a row with its image, name, and growth stage, and is clickable to view plant details.

import React, { memo, useCallback } from 'react';
import { View, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { ThemedText } from '@/ui/ThemedText';
import type { Plant } from '@/firestoreModels';
import { useRouter } from 'expo-router';

interface GroupPlantListProps {
  plants: (Plant & { id: string })[];
}

const GroupPlantList = memo(function GroupPlantList({ plants }: GroupPlantListProps) {
  const router = useRouter();
  const handlePlantPress = useCallback((id: string) => {
    router.push({ pathname: '/plant/[id]', params: { id } });
  }, [router]);

  // Show a message if there are no plants in the group
  if (plants.length === 0) {
    return <ThemedText>No plants assigned to this group.</ThemedText>;
  }

  // Render a list of plant rows
  return (
    <View style={styles.listContainer}>
      {plants.map((p) => (
        <TouchableOpacity
          key={p.id}
          style={styles.plantRow}
          onPress={() => handlePlantPress(p.id)}
          accessibilityLabel={`View details for ${p.name}`}
        >
          {/* Plant image or placeholder */}
          {p.imageUri ? (
            <Image source={{ uri: p.imageUri }} style={styles.plantImage} />
          ) : (
            <View style={styles.plantPlaceholder} />
          )}
          <View style={styles.plantInfo}>
            {/* Plant name and growth stage */}
            <ThemedText style={styles.plantName}>{p.name}</ThemedText>
            <ThemedText style={styles.plantStage}>{p.growthStage || 'Unknown stage'}</ThemedText>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
});

export default GroupPlantList;

// Styles for plant rows and images
const styles = StyleSheet.create({
  listContainer: { gap: 8 },
  plantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2226',
    borderRadius: 8,
    padding: 8,
  },
  plantImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
    backgroundColor: '#333',
  },
  plantPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
    backgroundColor: '#333',
  },
  plantInfo: { flex: 1 },
  plantName: { fontWeight: 'bold', fontSize: 16 },
  plantStage: { fontSize: 13, color: '#8bc34a', marginTop: 2 },
});
