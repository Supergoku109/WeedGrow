import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Image, Alert } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ActivityIndicator, IconButton } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Animated from 'react-native-reanimated';
import { doc, getDoc, deleteDoc, collection, getDocs, writeBatch } from 'firebase/firestore';
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
import type { WeatherCacheEntry } from '@/firestoreModels';
import { fetchWateringHistory, DEFAULT_HISTORY_DAYS, WateringHistoryEntry } from '@/lib/logs/fetchWateringHistory';
import WeeklyPlantCalendarBar, { WeeklyDayData } from '@/ui/WeeklyPlantCalendarBar';

export default function PlantDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [plant, setPlant] = useState<Plant | null>(null);
  const [loading, setLoading] = useState(true);
  const [weather, setWeather] = useState<(WeatherCacheEntry | null)[]>([]);
  const [history, setHistory] = useState<WateringHistoryEntry[]>([]);
  const [weekData, setWeekData] = useState<WeeklyDayData[]>([]);
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
                // Recursively delete plant and all subcollections using Firestore Admin SDK via a callable cloud function
                // or REST endpoint. For now, attempt client-side recursive delete for emulator/dev only:
                // (This will only work if you have a backend or emulator with recursive delete enabled)
                // If not, fallback to manual subcollection deletion:
                const plantRef = doc(db, 'plants', String(id));
                // Delete all subcollections: logs, weatherCache, progressPics, etc.
                const deleteSubcollection = async (sub: string) => {
                  const subSnap = await getDocs(collection(db, 'plants', String(id), sub));
                  const batch = writeBatch(db);
                  subSnap.forEach(doc => batch.delete(doc.ref));
                  await batch.commit();
                };
                await Promise.all([
                  deleteSubcollection('logs'),
                  deleteSubcollection('weatherCache'),
                  deleteSubcollection('progressPics'),
                ]);
                await deleteDoc(plantRef);
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

  useEffect(() => {
    if (!plant || plant.environment !== 'outdoor') return;
    if (!plant.location) return;
    const fetchWeekData = async () => {
      const today = new Date();
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay()); // Sunday
      const days: WeeklyDayData[] = [];
      for (let i = 0; i < 7; i++) {
        const d = new Date(weekStart);
        d.setDate(weekStart.getDate() + i);
        days.push({
          date: d.toISOString().split('T')[0],
          day: d.toLocaleDateString('en-US', { weekday: 'short' }),
          dayNum: d.getDate(),
          minTemp: null,
          maxTemp: null,
          rain: null,
          humidity: null,
          watered: false,
          isToday: d.toDateString() === today.toDateString(),
        });
      }
      // Fetch weatherCache for each day
      const weatherEntries = await Promise.all(
        days.map(async (day) => {
          const ref = doc(db, 'plants', String(id), 'weatherCache', day.date);
          const snap = await getDoc(ref);
          return snap.exists() ? snap.data() as WeatherCacheEntry : null;
        })
      );
      // Merge weather data
      days.forEach((day, i) => {
        const w = weatherEntries[i];
        if (w) {
          // Use detailedTemps if available
          if (w.detailedTemps) {
            day.minTemp = typeof w.detailedTemps.min === 'number' ? w.detailedTemps.min : null;
            day.maxTemp = typeof w.detailedTemps.max === 'number' ? w.detailedTemps.max : null;
            // Pass all detailedTemps for UI
            day.detailedTemps = {
              morn: typeof w.detailedTemps.morn === 'number' ? w.detailedTemps.morn : null,
              day: typeof w.detailedTemps.day === 'number' ? w.detailedTemps.day : null,
              eve: typeof w.detailedTemps.eve === 'number' ? w.detailedTemps.eve : null,
              night: typeof w.detailedTemps.night === 'number' ? w.detailedTemps.night : null,
              min: typeof w.detailedTemps.min === 'number' ? w.detailedTemps.min : null,
              max: typeof w.detailedTemps.max === 'number' ? w.detailedTemps.max : null,
            };
          } else {
            const temps = [
              typeof w.temperature === 'number' ? w.temperature : null,
              w.hourlySummary && typeof w.hourlySummary.peakTemp === 'number' ? w.hourlySummary.peakTemp : null
            ].filter((v): v is number => v !== null && !isNaN(v));
            if (temps.length === 2) {
              day.minTemp = Math.min(temps[0], temps[1]);
              day.maxTemp = Math.max(temps[0], temps[1]);
            } else if (temps.length === 1) {
              day.minTemp = day.maxTemp = temps[0];
            } else {
              day.minTemp = day.maxTemp = null;
            }
          }
          day.rain = typeof w.rainfall === 'number' ? w.rainfall : null;
          day.humidity = typeof w.humidity === 'number' ? w.humidity : null;
        }
      });
      // Merge watering logs
      days.forEach((day) => {
        const hist = history.find(h => h.date === day.date);
        day.watered = !!hist && hist.watered;
      });
      setWeekData(days);
    };
    fetchWeekData();
  }, [plant, history, id]);

  const handleLogWater = (date: string) => {
    // TODO: Implement log water for the given date
    // e.g. open modal or directly log
    alert(`Log watering for ${date}`);
  };

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
      {/* Place delete button in the header, top right, floating over the image */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 0 }}>
        {/* Plant image as a header with overlay */}
        {plant.imageUri && (
          <View style={styles.headerImageWrapper}>
            <Animated.View sharedTransitionTag={`plant.${id}.photo`}>
              <Image source={{ uri: plant.imageUri }} style={styles.headerImage} />
              <View style={styles.headerOverlay} />
              <ThemedText type="title" style={styles.headerTitle}>{plant.name}</ThemedText>
              <ThemedText style={styles.headerStrain}>{plant.strain}</ThemedText>
              <IconButton
                icon="delete"
                mode="contained"
                iconColor={Colors[theme].white}
                containerColor={Colors[theme].tint}
                onPress={confirmDelete}
                style={styles.headerDelete}
                accessibilityLabel="Delete Plant"
              />
            </Animated.View>
          </View>
        )}
        {/* Weather bar section */}
        {plant.environment === 'outdoor' && weekData.length === 7 && (
          <View style={styles.sectionWeather}>
            <ThemedText type="subtitle" style={styles.weatherTitle}>This Week</ThemedText>
            <WeeklyPlantCalendarBar weekData={weekData} onLogWater={handleLogWater} />
          </View>
        )}
        {/* Plant info cards */}
        <View style={styles.sectionCards}>
          <List.Item
            title="Growth Stage"
            description={plant.growthStage}
            left={props => <List.Icon {...props} icon="sprout" />}
            style={styles.infoCard}
          />
          <List.Item
            title="Environment"
            description={plant.environment}
            left={props => <List.Icon {...props} icon={plant.environment === 'indoor' ? 'home' : plant.environment === 'greenhouse' ? 'greenhouse' : 'tree'} />}
            style={styles.infoCard}
          />
          <List.Item
            title="Status"
            description={plant.status}
            left={props => <List.Icon {...props} icon={plant.status === 'active' ? 'check-circle-outline' : plant.status === 'archived' ? 'archive' : plant.status === 'harvested' ? 'flower' : 'skull'} />}
            style={styles.infoCard}
          />
        </View>
        {/* Notes, Fertilizer, Pests */}
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
        {/* Spacer for visual balance */}
        <View style={{ height: 32 }} />
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
  sectionWeather: {
    marginTop: 0,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingTop: 12,
  },
  weatherTitle: {
    marginBottom: 2,
    marginLeft: 2,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  headerImageWrapper: {
    width: '100%',
    height: 220,
    position: 'relative',
    marginBottom: 0,
  },
  headerImage: {
    width: '100%',
    height: 220,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.18)',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: {
    position: 'absolute',
    bottom: 38,
    left: 20,
    color: '#fff',
    fontSize: 26,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  headerStrain: {
    position: 'absolute',
    bottom: 18,
    left: 20,
    color: '#e0e7ff',
    fontSize: 16,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  sectionCards: {
    marginTop: 8,
    marginBottom: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#f8fafc',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  infoCard: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    marginVertical: 2,
    paddingVertical: 0,
  },
  headerDelete: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    elevation: 8,
    backgroundColor: '#ef4444',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  section: {
    marginTop: 12,
    marginBottom: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
});
