import React, { useState } from 'react';
import { View, Image, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { PlantItem } from '../api/fetchPlants';
import GroupLocationSelector from './GroupLocationSelector';

interface PlantSelectionProps {
  plants: PlantItem[];
  selectedPlantIds: string[];
  onTogglePlant: (id: string) => void;
  groupLocationPlantId?: string | null;
  onSelectGroupLocationPlantId?: (id: string) => void;
}

export const PlantSelection: React.FC<PlantSelectionProps> = ({ plants, selectedPlantIds, onTogglePlant, groupLocationPlantId, onSelectGroupLocationPlantId }) => {
  const theme = (useColorScheme() ?? 'dark') as 'light' | 'dark';

  const selectedPlants = plants.filter(p => selectedPlantIds.includes(p.id));
  const selectableLocationPlants = selectedPlants.filter(p => p.location);
  const hasOutdoor = selectedPlants.some(p => p.environment === 'outdoor');

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {plants.map((plant) => {
        const isSelected = selectedPlantIds.includes(plant.id);
        const selectedEnv = selectedPlantIds.length > 0
          ? plants.find(p => p.id === selectedPlantIds[0])?.environment
          : null;
        const isDisabled = Boolean(selectedEnv && plant.environment !== selectedEnv && !isSelected);

        return (
          <TouchableOpacity
            key={plant.id}
            onPress={() => {
              if (isDisabled) return;
              onTogglePlant(plant.id);
              if (onSelectGroupLocationPlantId && groupLocationPlantId === plant.id) {
                onSelectGroupLocationPlantId(''); // Pass empty string instead of null
              }
            }}
            style={[
              styles.card,
              isSelected && { borderColor: Colors[theme].tint },
              isDisabled && { opacity: 0.4 },
            ]}
            disabled={isDisabled}
          >
            {plant.imageUri ? (
              <Image source={{ uri: plant.imageUri }} style={styles.image} />
            ) : (
              <View style={[styles.image, { backgroundColor: '#ccc', alignItems: 'center', justifyContent: 'center' }]}> 
                <Text style={{ fontSize: 32, color: '#fff' }}>{plant.name?.[0] || '?'}</Text>
              </View>
            )}
            <View style={styles.infoContainer}>
              <Text style={[styles.name, { color: Colors[theme].text }]}>{plant.name}</Text>
              <Text style={[styles.environment, { color: Colors[theme].gray }]}>
                {plant.locationNickname || plant.environment}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
      {/* Location selection radio list */}
      {selectedPlantIds.length >= 2 && hasOutdoor && (
        <>
          <Text style={{ fontWeight: 'bold', fontSize: 17, marginBottom: 12, color: Colors[theme].text, marginLeft: 2 }}>📍 Choose Location for Weather</Text>
          <GroupLocationSelector
            plants={selectableLocationPlants}
            groupLocationPlantId={groupLocationPlantId}
            onSelectGroupLocationPlantId={onSelectGroupLocationPlantId}
            theme={theme}
          />
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 16,
  },
  card: {
    width: '48%',
    borderWidth: 2,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 8,
    marginBottom: 16,
    backgroundColor: Colors.dark.background,
    alignItems: 'center',
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 8,
  },
  infoContainer: {
    alignItems: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  environment: {
    fontSize: 14,
  },
});
