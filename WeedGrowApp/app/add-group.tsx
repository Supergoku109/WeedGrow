import React, { useEffect, useState, useRef } from 'react';
import { ScrollView, View, Alert, Dimensions, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TextInput, Button, RadioButton, ActivityIndicator } from 'react-native-paper';
import MapView, { Marker, MapPressEvent } from 'react-native-maps';
import * as Location from 'expo-location';
import { collection, getDocs, query } from 'firebase/firestore';
import { useRouter } from 'expo-router';

import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { db } from '@/services/firebase';
import { Plant } from '@/firestoreModels';
import { ThemedText } from '@/components/ThemedText';
import { createGroup } from '@/lib/groups';

interface PlantItem extends Plant {
  id: string;
}

export default function AddGroupScreen() {
  const router = useRouter();
  const [plants, setPlants] = useState<PlantItem[]>([]);
  const [loadingPlants, setLoadingPlants] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [selectedPlantId, setSelectedPlantId] = useState<string | null>(null);
  const [environment, setEnvironment] = useState<'outdoor' | 'indoor' | 'greenhouse' | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locLoading, setLocLoading] = useState(false);
  const mapRef = useRef<MapView | null>(null);
  type Theme = keyof typeof Colors;
  const theme = (useColorScheme() ?? 'dark') as Theme;

  useEffect(() => {
    const fetchPlants = async () => {
      try {
        const q = query(collection(db, 'plants'));
        const snap = await getDocs(q);
        const items: PlantItem[] = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Plant),
        }));
        setPlants(items);
      } catch (e: any) {
        console.error('Error fetching plants', e);
        setError(e.message || 'Failed to load plants');
      } finally {
        setLoadingPlants(false);
      }
    };
    fetchPlants();
  }, []);

  const handleSelectPlant = (id: string, env: 'outdoor' | 'indoor' | 'greenhouse') => {
    setSelectedPlantId(id);
    setEnvironment(env);
  };

  const getLocation = async () => {
    try {
      setLocLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required.');
        return;
      }
      const lastKnown = await Location.getLastKnownPositionAsync();
      const coords = lastKnown?.coords
        ? lastKnown.coords
        : (await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced, timeout: 5000 })).coords;
      setLocation({ lat: coords.latitude, lng: coords.longitude });
      mapRef.current?.animateToRegion(
        { latitude: coords.latitude, longitude: coords.longitude, latitudeDelta: 0.005, longitudeDelta: 0.005 },
        500
      );
    } catch (e) {
      console.error('Location error', e);
    } finally {
      setLocLoading(false);
    }
  };

  const handleMapPress = (e: MapPressEvent) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setLocation({ lat: latitude, lng: longitude });
    mapRef.current?.animateToRegion({ latitude, longitude, latitudeDelta: 0.005, longitudeDelta: 0.005 }, 500);
  };

  const create = async () => {
    if (!name.trim() || !selectedPlantId || !environment) return;
    try {
      await createGroup({
        name: name.trim(),
        firstPlantId: selectedPlantId,
        environment,
        location: environment === 'outdoor' ? location : null,
        createdBy: 'demoUser',
      });
      router.back();
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to create group');
    }
  };

  const screen = Dimensions.get('window');

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: Colors[theme].background }]}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.contentContainer}>
        <ThemedText type="title" style={styles.title}>
          Create Group
        </ThemedText>

        {loadingPlants && (
          <ActivityIndicator style={styles.loading} color={Colors[theme].tint} />
        )}
        {error && <ThemedText>❌ {error}</ThemedText>}

        <TextInput
          label="Group Name"
          value={name}
          onChangeText={setName}
          style={styles.input}
        />

        <ThemedText style={styles.sectionLabel}>Choose the first plant</ThemedText>
        <RadioButton.Group
          onValueChange={id => {
            const plant = plants.find(p => p.id === id);
            if (plant) handleSelectPlant(plant.id, plant.environment);
          }}
          value={selectedPlantId ?? ''}
        >
          {plants.map(p => (
            <RadioButton.Item
              key={p.id}
              value={p.id}
              label={`${p.name} (${p.environment})`}
              disabled={
                !!environment && p.environment !== environment && selectedPlantId !== p.id
              }
            />
          ))}
        </RadioButton.Group>

        {environment === 'outdoor' && (
          <>
            <Button icon="crosshairs-gps" loading={locLoading} onPress={getLocation} style={styles.locationButton}>
              \u{1F4CD} Use My Location
            </Button>
            <View style={styles.mapContainer}>
              {location ? (
                <MapView
                  ref={mapRef}
                  style={[styles.map, { width: screen.width - 32 }]}
                  onPress={handleMapPress}
                  initialRegion={{
                    latitude: location.lat,
                    longitude: location.lng,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                  }}
                >
                  <Marker
                    coordinate={{ latitude: location.lat, longitude: location.lng }}
                    pinColor="green"
                  />
                </MapView>
              ) : (
                <View style={[styles.mapPlaceholder, { width: screen.width - 32 }]}
                >
                  <ThemedText>No location selected</ThemedText>
                </View>
              )}
            </View>
            <ThemedText style={styles.mapHint}>
              Tap the map to adjust your location
            </ThemedText>
          </>
        )}

        <View style={styles.actionRow}>
          <Button mode="outlined" onPress={() => router.back()}>
            Cancel
          </Button>
          <Button
            mode="contained"
            onPress={create}
            disabled={
              !name.trim() ||
              !selectedPlantId ||
              (environment === 'outdoor' && !location)
            }
          >
            Create
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingTop: 8,
  },
  scroll: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 16,
  },
  title: {
    textAlign: 'center',
  },
  loading: {
    marginTop: 8,
  },
  input: {
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  sectionLabel: {
    marginBottom: 8,
  },
  locationButton: {
    marginTop: 8,
  },
  mapContainer: {
    height: 300,
    borderRadius: 12,
    overflow: 'hidden',
  },
  map: {
    height: 300,
  },
  mapPlaceholder: {
    height: 300,
    backgroundColor: '#ccc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapHint: {
    textAlign: 'center',
    marginTop: 8,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
});

