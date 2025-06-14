import React from 'react';
import { View, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { ThemedText } from '@/ui/ThemedText';
import type { Plant } from '@/firestoreModels';
import { useRouter } from 'expo-router';

interface Props {
  plants: (Plant & { id: string })[];
}

export default function GroupPlantList({ plants }: Props) {
  const router = useRouter();

  if (plants.length === 0) {
    return <ThemedText>No plants assigned to this group.</ThemedText>;
  }

  return (
    <View style={{ gap: 8 }}>
      {plants.map((p) => (
        <TouchableOpacity
          key={p.id}
          style={styles.plantRow}
          onPress={() => router.push({ pathname: '/plant/[id]', params: { id: p.id } })}
          accessibilityLabel={`View details for ${p.name}`}
        >
          {p.imageUri ? (
            <Image source={{ uri: p.imageUri }} style={styles.plantImage} />
          ) : (
            <View style={styles.plantPlaceholder} />
          )}
          <View style={{ flex: 1 }}>
            <ThemedText style={styles.plantName}>{p.name}</ThemedText>
            <ThemedText style={styles.plantStage}>{p.growthStage || 'Unknown stage'}</ThemedText>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
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
    backgroundColor: '#ccc',
  },
  plantPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
    backgroundColor: '#ccc',
  },
  plantName: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  plantStage: {
    fontSize: 13,
    color: '#888',
  },
});
