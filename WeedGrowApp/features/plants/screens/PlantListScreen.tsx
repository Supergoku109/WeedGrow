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
import { ActivityIndicator, Searchbar, IconButton, Chip } from 'react-native-paper';
import { PlantCard } from '@/features/plants/components/PlantCard';
import { usePlantList } from '@/features/plants/hooks/usePlantList';

export default function PlantListScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = (useColorScheme() ?? 'dark') as keyof typeof Colors;
  const {
    filteredPlants, loading, error,
    searchQuery, setSearchQuery, filtersVisible, setFiltersVisible,
    statusFilter, setStatusFilter, envFilter, setEnvFilter,
    plantedFilter, setPlantedFilter, trainingFilter, setTrainingFilter,
    weatherMap
  } = usePlantList();

  return (
    <View style={[styles.safeArea, { backgroundColor: Colors[theme].background, paddingTop: insets.top }]}>
      <ThemedView style={styles.container}>
        <ThemedText type="title" style={styles.title}>My Plants</ThemedText>

        <View style={styles.searchRow}>
          <Searchbar placeholder="Search plants" value={searchQuery} onChangeText={setSearchQuery} style={[styles.searchBar, { flex: 1 }]} />
          <IconButton icon={filtersVisible ? 'filter-off-outline' : 'filter-variant'} onPress={() => setFiltersVisible((v) => !v)} />
        </View>

        {filtersVisible && (
          <View style={styles.filtersContainer}>
            <FilterChips label="Status" options={['active', 'archived', 'harvested', 'dead']} value={statusFilter} setValue={setStatusFilter} />
            <FilterChips label="Environment" options={['outdoor', 'greenhouse', 'indoor']} value={envFilter} setValue={setEnvFilter} />
            <FilterChips label="Planted In" options={['pot', 'ground']} value={plantedFilter} setValue={setPlantedFilter} />
            <FilterChips label="Training" options={['LST', 'Topping', 'SCROG']} value={trainingFilter} setValue={setTrainingFilter} />
          </View>
        )}

        {loading && <ActivityIndicator style={styles.loading} color={Colors[theme].tint} />}
        {error && <ThemedText style={[styles.errorText, { color: Colors[theme].tint }]}>❌ Error: {error}</ThemedText>}
        {!loading && !error && filteredPlants.length > 0 && (
          <FlatList
            data={filteredPlants}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <PlantCard plant={item} weather={weatherMap[item.id]} />
            )}
          />
        )}
        {!loading && !error && filteredPlants.length === 0 && (
          <ThemedText>No plants found.</ThemedText>
        )}

        <TouchableOpacity onPress={() => router.push('/add-plant')} style={[styles.fab, { backgroundColor: Colors[theme].tint }]}>
          <MaterialCommunityIcons name="plus" size={28} color={Colors[theme].white} />
        </TouchableOpacity>
      </ThemedView>
    </View>
  );
}

const FilterChips = ({ label, options, value, setValue }: any) => (
  <>
    <ThemedText style={styles.filterLabel}>{label}</ThemedText>
    <View style={styles.chipRow}>
      <Chip selected={!value} onPress={() => setValue(null)}>All</Chip>
      {options.map((opt: string) => (
        <Chip key={opt} selected={value === opt} onPress={() => setValue(opt)}>{opt}</Chip>
      ))}
    </View>
  </>
);

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1, padding: 16 },
  title: { textAlign: 'center', marginBottom: 20 },
  searchRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  searchBar: { marginRight: 8 },
  filtersContainer: { marginBottom: 12, gap: 8 },
  filterLabel: { marginBottom: 4 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  loading: { marginTop: 20 },
  errorText: { marginTop: 10 },
  fab: { position: 'absolute', right: 20, bottom: 20, width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', elevation: 5 },
});
