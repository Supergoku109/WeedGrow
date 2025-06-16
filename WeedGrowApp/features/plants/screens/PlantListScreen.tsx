// features/plants/screens/PlantListScreen.tsx

import React from 'react';
import { FlatList, View, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { ThemedView } from '@/ui/ThemedView';
import { ThemedText } from '@/ui/ThemedText';
import { ActivityIndicator, IconButton, Chip } from 'react-native-paper';
import { PlantCard } from '@/features/plants/components/PlantCard';
import { usePlantList } from '@/features/plants/hooks/usePlantList';

interface PlantListScreenProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  filtersVisible: boolean;
  setFiltersVisible: (v: boolean) => void;
  statusFilter: string | null;
  setStatusFilter: (v: string | null) => void;
  envFilter: string | null;
  setEnvFilter: (v: string | null) => void;
  plantedFilter: string | null;
  setPlantedFilter: (v: string | null) => void;
  trainingFilter: string | null;
  setTrainingFilter: (v: string | null) => void;
}

export default function PlantListScreen({
  searchQuery,
  setSearchQuery,
  filtersVisible,
  setFiltersVisible,
  statusFilter,
  setStatusFilter,
  envFilter,
  setEnvFilter,
  plantedFilter,
  setPlantedFilter,
  trainingFilter,
  setTrainingFilter,
}: PlantListScreenProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = (useColorScheme() ?? 'dark') as keyof typeof Colors;
  const {
    plants, loading, error, weatherMap
  } = usePlantList();

  // Filter plants using props
  const filteredPlants = plants.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (!statusFilter || p.status === statusFilter) &&
      (!envFilter || p.environment === envFilter) &&
      (!plantedFilter || p.plantedIn === plantedFilter) &&
      (!trainingFilter || (p.trainingTags && p.trainingTags.includes(trainingFilter)))
  );

  return (
    <View style={[styles.safeArea, { backgroundColor: Colors[theme].background, paddingTop: insets.top }]}>
      <ThemedView style={styles.container}>
        {/* <ThemedText type="title" style={styles.title}>My Plants</ThemedText> */}

        {loading && <ActivityIndicator style={styles.loading} color={Colors[theme].tint} />}
        {error && <ThemedText style={[styles.errorText, { color: Colors[theme].tint }]}>❌ Error: {error}</ThemedText>}
        {!loading && !error && filteredPlants.length > 0 && (
          <FlatList
            data={filteredPlants}
            keyExtractor={(item) => item.id}
            renderItem={({ item, index }) => (
              <>
                <PlantCard plant={item} weather={weatherMap[item.id]} />
                {index === filteredPlants.length - 1 && (
                  <View style={{ alignItems: 'center', marginTop: 16 }}>
                    <TouchableOpacity
                      accessibilityLabel="Add Plant"
                      onPress={() => router.push('/add-plant')}
                      style={[styles.addPlantButton, { backgroundColor: Colors[theme].tint }]}
                    >
                      <MaterialCommunityIcons name="plus" size={24} color={Colors[theme].white} />
                      <ThemedText style={styles.addPlantText}>Add Plant</ThemedText>
                    </TouchableOpacity>
                  </View>
                )}
              </>
            )}
          />
        )}
        {!loading && !error && filteredPlants.length === 0 && (
          <View style={{ alignItems: 'center', marginTop: 32 }}>
            <TouchableOpacity
              accessibilityLabel="Add Plant"
              onPress={() => router.push('/add-plant')}
              style={[styles.addPlantButton, { backgroundColor: Colors[theme].tint }]}
            >
              <MaterialCommunityIcons name="plus" size={24} color={Colors[theme].white} />
              <ThemedText style={styles.addPlantText}>Add Plant</ThemedText>
            </TouchableOpacity>
          </View>
        )}
      </ThemedView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1, padding: 16 },
  loading: { marginTop: 20 },
  errorText: { marginTop: 10 },
  addPlantButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    marginTop: 8,
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  addPlantText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
});
