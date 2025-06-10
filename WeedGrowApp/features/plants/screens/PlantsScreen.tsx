import React, { useEffect, useState } from 'react';
import { StyleSheet, FlatList, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
  const theme = (useColorScheme() ?? 'dark') as 'light' | 'dark';
  const [plants, setPlants] = useState<PlantItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredPlants, setFilteredPlants] = useState<PlantItem[]>([]);
  const [weatherData, setWeatherData] = useState<any>(null);

  useEffect(() => {
    const fetchPlants = async () => {
      setLoading(true);
      try {
        const plantsCollection = collection(db, 'plants');
        const plantsQuery = query(plantsCollection);
        const querySnapshot = await getDocs(plantsQuery);
        const plantsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as PlantItem[];

        setPlants(plantsData);
        setFilteredPlants(plantsData);

        // Fetch weather data for the first plant as an example
        if (plantsData.length > 0 && plantsData[0].location) {
          const { lat, lng } = plantsData[0].location;
          const weather = await fetchWeather(lat, lng);
          setWeatherData(weather);
        }
      } catch (error) {
        console.error('Error fetching plants: ', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlants();
  }, []);

  useEffect(() => {
    const filtered = plants.filter((plant) =>
      plant.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredPlants(filtered);
  }, [searchQuery, plants]);

  const handlePlantPress = (plant: PlantItem) => {
    router.push(`/plant/${plant.id}`);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  const handleWeatherUpdate = async (plant: PlantItem) => {
    try {
      if (plant.location) {
        const { lat, lng } = plant.location;
        const weather = await fetchWeather(lat, lng);
        await updateWeatherCache(plant.id, weather);
        setWeatherData(weather);
      }
    } catch (error) {
      console.error('Error updating weather: ', error);
    }
  };

  const renderPlantItem = ({ item }: { item: PlantItem }) => (
    <PlantCard
      plant={item}
      weather={weatherData}
    />
  );

  if (loading) {
    return (
      <ThemedView style={[styles.container, { backgroundColor: Colors[theme].background }]}> 
        <ActivityIndicator size="large" color={Colors[theme].tint} />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, { backgroundColor: Colors[theme].background }]}> 
      <Searchbar
        placeholder="Search plants..."
        onChangeText={handleSearchChange}
        value={searchQuery}
        style={styles.searchBar}
        inputStyle={{ fontSize: 17 }}
        iconColor={Colors[theme].tint}
      />
      {filteredPlants.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="emoticon-sad-outline" size={54} color="#94a3b8" style={{ marginBottom: 12 }} />
          <ThemedText style={styles.emptyText}>No plants found</ThemedText>
          <ThemedText style={styles.emptySubText}>Tap the + button to add your first plant!</ThemedText>
        </View>
      ) : (
        <FlatList
          data={filteredPlants}
          renderItem={renderPlantItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.plantList}
          showsVerticalScrollIndicator={false}
        />
      )}
      <IconButton
        icon="plus"
        size={32}
        mode="contained"
        iconColor="#fff"
        containerColor={Colors[theme].tint}
        style={styles.fab}
        onPress={() => router.push('/add-plant/step1')}
        accessibilityLabel="Add Plant"
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    // backgroundColor moved to inline style for theme support
  },
  searchBar: {
    marginBottom: 16,
    backgroundColor: '#23272a', // dark search bar
    color: '#fff',
    borderRadius: 12,
  },
  plantList: {
    paddingBottom: 32,
    paddingTop: 4,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
    paddingHorizontal: 24,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#00c853', // green accent
    marginBottom: 4,
    textAlign: 'center',
  },
  emptySubText: {
    fontSize: 15,
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 12,
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 32,
    zIndex: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    backgroundColor: '#00c853', // green FAB
  },
});
