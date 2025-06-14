import React, { useEffect, useState } from 'react';
import { StyleSheet, FlatList, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { ThemedView } from '@/ui/ThemedView';
import { ThemedText } from '@/ui/ThemedText';
import { PlantCard } from '@/features/plants/components/PlantCard';
import { fetchPlantWeatherContext } from '@/lib/weather/fetchPlantWeatherContext';
import type { PlantAdviceContext } from '@/lib/weather/getPlantAdvice';
import { collection, getDocs, query } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { Plant } from '@/firestoreModels';
import {
  ActivityIndicator,
  Searchbar,
  IconButton,
  Chip,
} from 'react-native-paper';
import { fetchWeather } from '@/lib/weather/fetchWeather';
import { parseWeatherData } from '@/lib/weather/parseWeatherData';
import { updateWeatherCache } from '@/lib/weather/updateFirestore';
import { shouldUpdateWeather } from '@/lib/weather/shouldUpdateWeather';

interface PlantItem extends Plant {
  id: string;
}

export default function PlantsScreen() {
  const router = useRouter();
  const [plants, setPlants] = useState<PlantItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [envFilter, setEnvFilter] = useState<string | null>(null);
  const [plantedFilter, setPlantedFilter] = useState<string | null>(null);
  const [trainingFilter, setTrainingFilter] = useState<string | null>(null);
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [weatherMap, setWeatherMap] = useState<Record<string, PlantAdviceContext | undefined>>({});
  type Theme = keyof typeof Colors;
  const theme = (useColorScheme() ?? 'dark') as Theme;
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const fetchPlants = async () => {
      try {
        const plantsQuery = query(collection(db, 'plants'));
        const snapshot = await getDocs(plantsQuery);
        const items: PlantItem[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Plant),
        }));
        setPlants(items);

        // Efficient weather update: only update if missing or stale
        await Promise.all(
          items.map(async (p) => {
            if (p.location && p.location.lat && p.location.lng) {
              try {
                const needsUpdate = await shouldUpdateWeather(p.id);
                if (needsUpdate) {
                  const weatherApiData = await fetchWeather(p.location.lat, p.location.lng);
                  const parsed = parseWeatherData(weatherApiData);
                  await updateWeatherCache(p.id, parsed);
                }
              } catch (err) {
                // Ignore errors, will fallback to showing no weather info
                console.warn('Weather update failed for plant', p.id, err);
              }
            }
          })
        );

        const weatherResults = await Promise.all(
          items.map(async (p) => {
            try {
              return await fetchPlantWeatherContext(p.id);
            } catch (e) {
              return undefined;
            }
          })
        );
        const map: Record<string, PlantAdviceContext | undefined> = {};
        items.forEach((p, idx) => {
          map[p.id] = weatherResults[idx];
        });
        setWeatherMap(map);
      } catch (e: any) {
        console.error('Error fetching plants:', e);
        setError(e.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchPlants();
  }, []);

  // Restore filteredPlants declaration
  const filteredPlants = plants.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (!statusFilter || p.status === statusFilter) &&
      (!envFilter || p.environment === envFilter) &&
      (!plantedFilter || p.plantedIn === plantedFilter) &&
      (!trainingFilter || (p.trainingTags && p.trainingTags.includes(trainingFilter)))
  );

  return (
    <View style={[
      styles.safeArea,
      { backgroundColor: Colors[theme].background, flex: 1, paddingTop: insets.top }
    ]}>
      <ThemedView style={styles.container}>
        <ThemedText type="title" style={styles.title}>
          My Plants
        </ThemedText>
        <View style={styles.searchRow}>
          <Searchbar
            placeholder="Search plants"
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={[styles.searchBar, { flex: 1 }]}
          />
          <IconButton
            icon={filtersVisible ? 'filter-off-outline' : 'filter-variant'}
            onPress={() => setFiltersVisible((v) => !v)}
            accessibilityLabel={filtersVisible ? 'Hide filters' : 'Show filters'}
          />
        </View>

        {filtersVisible && (
          <View style={styles.filtersContainer}>
            <ThemedText style={styles.filterLabel}>Status</ThemedText>
            <View style={styles.chipRow}>
              <Chip
                selected={!statusFilter}
                onPress={() => setStatusFilter(null)}
                accessibilityLabel="Clear status filter"
              >
                All
              </Chip>
              {['active', 'archived', 'harvested', 'dead'].map((opt) => (
                <Chip
                  key={opt}
                  selected={statusFilter === opt}
                  onPress={() => setStatusFilter(opt)}
                >
                  {opt}
                </Chip>
              ))}
            </View>

            <ThemedText style={styles.filterLabel}>Environment</ThemedText>
            <View style={styles.chipRow}>
              <Chip selected={!envFilter} onPress={() => setEnvFilter(null)}>
                All
              </Chip>
              {['outdoor', 'greenhouse', 'indoor'].map((opt) => (
                <Chip
                  key={opt}
                  selected={envFilter === opt}
                  onPress={() => setEnvFilter(opt)}
                >
                  {opt}
                </Chip>
              ))}
            </View>

            <ThemedText style={styles.filterLabel}>Planted In</ThemedText>
            <View style={styles.chipRow}>
              <Chip selected={!plantedFilter} onPress={() => setPlantedFilter(null)}>
                All
              </Chip>
              {['pot', 'ground'].map((opt) => (
                <Chip
                  key={opt}
                  selected={plantedFilter === opt}
                  onPress={() => setPlantedFilter(opt)}
                >
                  {opt}
                </Chip>
              ))}
            </View>

            <ThemedText style={styles.filterLabel}>Training</ThemedText>
            <View style={styles.chipRow}>
              <Chip
                selected={!trainingFilter}
                onPress={() => setTrainingFilter(null)}
              >
                All
              </Chip>
              {['LST', 'Topping', 'SCROG'].map((opt) => (
                <Chip
                  key={opt}
                  selected={trainingFilter === opt}
                  onPress={() => setTrainingFilter(opt)}
                >
                  {opt}
                </Chip>
              ))}
            </View>
          </View>
        )}
        {loading && (
          <ActivityIndicator style={styles.loading} color={Colors[theme].tint} />
        )}
        {error && (
          <ThemedText style={[styles.errorText, { color: Colors[theme].tint }] }>
            ❌ Error: {error}
          </ThemedText>
        )}
        {!loading && !error && plants.length === 0 && (
          <ThemedText>No plants found.</ThemedText>
        )}
        {!loading && !error && filteredPlants.length > 0 && (
          <FlatList
            data={filteredPlants}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <PlantCard plant={item} weather={weatherMap[item.id]} />
            )}
          />
        )}
        {!loading && !error && filteredPlants.length === 0 && plants.length > 0 && (
          <ThemedText>No plants match your filters.</ThemedText>
        )}
        <TouchableOpacity
          accessibilityLabel="Add Plant"
          onPress={() => router.push('/add-plant')}
          style={[styles.fab, { backgroundColor: Colors[theme].tint }]}
        >
          <MaterialCommunityIcons name="plus" size={28} color={Colors[theme].white} />
        </TouchableOpacity>
      </ThemedView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    textAlign: 'center',
    marginBottom: 20,
  },
  loading: {
    marginTop: 20,
  },
  errorText: {
    marginTop: 10,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  searchBar: {
    marginRight: 8,
  },
  filtersContainer: {
    marginBottom: 12,
    gap: 8,
  },
  filterLabel: {
    marginBottom: 4,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
  },
});
