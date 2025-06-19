import React from 'react';
import { View, Image, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { PlantItem } from '../api/fetchPlants';

interface PlantSelectionProps {
  plants: PlantItem[];
  selectedPlantIds: string[];
  onTogglePlant: (id: string) => void;
}

export const PlantSelection: React.FC<PlantSelectionProps> = ({ plants, selectedPlantIds, onTogglePlant }) => {
  const theme = (useColorScheme() ?? 'dark') as 'light' | 'dark';

  return (
    <View style={styles.container}>
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
            }}
            style={[
              styles.card,
              isSelected && { borderColor: Colors[theme].tint },
              isDisabled && { opacity: 0.4 },
            ]}
            disabled={isDisabled}
          >
            <Image source={{ uri: plant.imageUri }} style={styles.image} />
            <View style={styles.infoContainer}>
              <Text style={[styles.name, { color: Colors[theme].text }]}>{plant.name}</Text>
              <Text style={[styles.environment, { color: Colors[theme].gray }]}>
                {plant.environment}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
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
