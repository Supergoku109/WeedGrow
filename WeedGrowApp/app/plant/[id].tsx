import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Image, Alert } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ActivityIndicator, IconButton } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Animated from 'react-native-reanimated';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { Plant } from '@/firestoreModels';
import { ThemedView } from '@/ui/ThemedView';
import { ThemedText } from '@/ui/ThemedText';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { db } from '@/services/firebase';
import { List } from 'react-native-paper';
import { fetchWeather } from '@/lib/weather/fetchWeather';
import { parseWeatherData } from '@/lib/weather/parseWeatherData';
import { updateWeatherCache } from '@/lib/weather/updateFirestore';
import WeatherBar from '@/ui/WeatherBar';
import WateringHistoryBar from '@/ui/WateringHistoryBar';
import type { WeatherCacheEntry } from '@/firestoreModels';
import { fetchWateringHistory, DEFAULT_HISTORY_DAYS, WateringHistoryEntry } from '@/lib/logs/fetchWateringHistory';
import SensorProfileBar from '@/ui/SensorProfileBar';

export default function PlantDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [plant, setPlant] = useState<Plant | null>(null);
  const [loading, setLoading] = useState(true);
  const [weather, setWeather] = useState<(WeatherCacheEntry | null)[]>([]);
  const [history, setHistory] = useState<WateringHistoryEntry[]>([]);
  type Theme = keyof typeof Colors;
  const theme = (useColorScheme() ?? 'dark') as Theme;
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const confirmDelete = () => {
    Alert.alert(
      'Delete Plant',
      'Are you sure you want to delete this plant? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              if (id) {
                await deleteDoc(doc(db, 'plants', String(id)));
              }
              router.replace('/(tabs)/plants');
            } catch (e) {
              console.error('Error deleting plant:', e);
            }
          },
        },
      ],
    );
  };

  useEffect(() => {
    const fetchPlant = async () => {
      if (!id) {
        setLoading(false);
        return;
      }
      const ref = doc(db, 'plants', String(id));
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setPlant(snap.data() as Plant);
      }
      setLoading(false);
    };
    fetchPlant();
  }, [id]);

  useEffect(() => {
    // Load the cached weather entries for yesterday through two days ahead
    const fetchWeatherData = async () => {
      if (!id) return;
      const dates: string[] = [];
      for (let i = -1; i < 3; i++) {
        const d = new Date();
        d.setDate(d.getDate() + i);
        dates.push(d.toISOString().split('T')[0]);
      }
      const entries = await Promise.all(
        dates.map(async (d) => {
          const ref = doc(db, 'plants', String(id), 'weatherCache', d);
          const snap = await getDoc(ref);
          return snap.exists() ? (snap.data() as WeatherCacheEntry) : null;
        })
      );
      setWeather(entries);
    };
    fetchWeatherData();
  }, [id]);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!id) return;
      const h = await fetchWateringHistory(String(id), DEFAULT_HISTORY_DAYS);
      setHistory(h);
    };
    fetchHistory();
  }, [id]);

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors[theme].background }}>
        <ThemedView style={styles.center}>
          <ActivityIndicator color={Colors[theme].tint} />
        </ThemedView>
      </SafeAreaView>
    );
  }

  if (!plant) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors[theme].background }}>
        <ThemedView style={styles.center}>
          <ThemedText>Plant not found.</ThemedText>
        </ThemedView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors[theme].background }}>
      <IconButton
        icon="delete"
        mode="contained"
        iconColor={Colors[theme].white}
        containerColor={Colors[theme].tint}
        onPress={confirmDelete}
        style={[styles.deleteButton, { top: insets.top + 4 }]}
        accessibilityLabel="Delete Plant"
      />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
      {plant.imageUri && (
        <Animated.View sharedTransitionTag={`plant.${id}.photo`} style={styles.imageWrapper}>
          <Image source={{ uri: plant.imageUri }} style={styles.image} />
        </Animated.View>
      )}
      <ThemedText type="title" style={styles.title}>{plant.name}</ThemedText>
      <ThemedText style={styles.strain}>{plant.strain}</ThemedText>

      <View style={styles.section}>
        <List.Item
          title="Growth Stage"
          description={plant.growthStage}
          left={props => <List.Icon {...props} icon="sprout" />}
        />
        <List.Item
          title="Environment"
          description={plant.environment}
          left={props => <List.Icon {...props} icon={plant.environment === 'indoor' ? 'home' : plant.environment === 'greenhouse' ? 'greenhouse' : 'tree'} />}
        />
        <List.Item
          title="Status"
          description={plant.status}
          left={props => <List.Icon {...props} icon={plant.status === 'active' ? 'check-circle-outline' : plant.status === 'archived' ? 'archive' : plant.status === 'harvested' ? 'flower' : 'skull'} />}
        />
      </View>

      {weather.length === 4 && plant.environment === 'outdoor' && (
        <View style={styles.section}>
          <ThemedText type="subtitle">Weather</ThemedText>
          <WeatherBar data={weather.filter((w): w is WeatherCacheEntry => w !== null)} />
        </View>
      )}

      {(plant.environment === 'indoor' || plant.environment === 'greenhouse') && plant.sensorProfileId && (
        <View style={styles.section}>
          <ThemedText type="subtitle">Sensor Data</ThemedText>
          <SensorProfileBar sensorProfileId={plant.sensorProfileId} />
        </View>
      )}

      {history.length === DEFAULT_HISTORY_DAYS && (
        <View style={styles.section}>
          <ThemedText type="subtitle">Last {DEFAULT_HISTORY_DAYS} Days</ThemedText>
          <WateringHistoryBar history={history} />
        </View>
      )}

      {plant.notes ? (
        <View style={styles.section}>
          <ThemedText type="subtitle">Notes</ThemedText>
          <ThemedText>{plant.notes}</ThemedText>
        </View>
      ) : null}

      {plant.fertilizer ? (
        <View style={styles.section}>
          <ThemedText type="subtitle">Fertilization</ThemedText>
          <ThemedText>{plant.fertilizer}</ThemedText>
        </View>
      ) : null}

      {plant.pests && plant.pests.length > 0 ? (
        <View style={styles.section}>
          <ThemedText type="subtitle">Pests</ThemedText>
          <ThemedText>{plant.pests.join(', ')}</ThemedText>
        </View>
      ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    marginTop: 12,
    marginBottom: 4,
    textAlign: 'center',
  },
  strain: {
    textAlign: 'center',
    marginBottom: 16,
  },
  imageWrapper: {
    alignSelf: 'center',
    borderRadius: 8,
    overflow: 'hidden',
  },
  image: {
    height: 200,
    width: 200,
    borderRadius: 8,
  },
  section: {
    marginTop: 16,
    gap: 4,
  },
  deleteButton: {
    position: 'absolute',
    left: 16,
    zIndex: 10,
  },
});
