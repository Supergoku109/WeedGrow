// PLANT DETAIL SCREEN: This file displays all details, logs, weather, and actions for a single plant.
// If you are looking for the main plant detail UI, this is the correct file.

import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Alert, Image, Dimensions, FlatList } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ActivityIndicator, IconButton, Button } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Animated, { useSharedValue, useAnimatedScrollHandler, useAnimatedStyle, interpolate, Extrapolate } from 'react-native-reanimated';
import { doc, getDoc, deleteDoc, collection, getDocs, writeBatch } from 'firebase/firestore';
import { Plant, PlantLog } from '@/firestoreModels';
import { ThemedView } from '@/ui/ThemedView';
import { ThemedText } from '@/ui/ThemedText';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { db } from '@/services/firebase';
import type { WeatherCacheEntry } from '@/firestoreModels';
import { fetchWateringHistory, DEFAULT_HISTORY_DAYS, WateringHistoryEntry } from '@/lib/logs/fetchWateringHistory';
import WeeklyPlantCalendarBar, { WeeklyDayData } from '@/ui/WeeklyPlantCalendarBar';
import { addPlantLog } from '@/lib/logs/addPlantLog';
import { fetchPlantLogsForDate } from '@/lib/logs/fetchPlantLogsForDate';
import { fetchLogsAndWeatherForRange } from '@/lib/logs/fetchLogsAndWeatherForRange';

const HEADER_MAX_HEIGHT = 220;
const galleryBarHeight = 96;
const HEADER_MIN_HEIGHT = galleryBarHeight;

export default function PlantDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [plant, setPlant] = useState<Plant | null>(null);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<WateringHistoryEntry[]>([]);
  const [weekData, setWeekData] = useState<WeeklyDayData[]>([]);
  const [dailyLogs, setDailyLogs] = useState<Record<string, PlantLog[]>>({});
  const [expandedLogDate, setExpandedLogDate] = useState<string | null>(null);
  const [expandedLogLoading, setExpandedLogLoading] = useState(false);
  const [progressPics, setProgressPics] = useState<string[]>([]);
  const theme = (useColorScheme() ?? 'dark') as keyof typeof Colors;
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Animated style for the background image (absolute, collapses on scroll)
  const scrollY = useSharedValue(0);
  const maxScroll = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;
  const onScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = Math.min(event.contentOffset.y, maxScroll);
    },
  });
  const animatedBgImageStyle = useAnimatedStyle(() => {
    const height = interpolate(
      scrollY.value,
      [0, HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT],
      [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
      Extrapolate.CLAMP
    );
    return {
      position: 'absolute',
      top: insets.top, // Respect safe area
      left: 0,
      right: 0,
      width: '100%',
      height,
      zIndex: 0,
    };
  });

  const confirmDelete = () => {
    Alert.alert('Delete Plant', 'Are you sure you want to delete this plant?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            if (id) {
              const plantRef = doc(db, 'plants', String(id));
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
        }
      }
    ]);
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
    if (!plant) return;
    const fetchHistory = async () => {
      const h = await fetchWateringHistory(String(id), DEFAULT_HISTORY_DAYS);
      setHistory(h);
    };
    fetchHistory();
  }, [plant, id]);

  // --- Replace the weekData population effect with weather integration ---
  useEffect(() => {
    if (!plant || plant.environment !== 'outdoor') return;
    const fetchWeekData = async () => {
      const today = new Date();
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());
      const startDate = weekStart.toISOString().split('T')[0];
      const endDate = new Date(weekStart);
      endDate.setDate(weekStart.getDate() + 6);
      const endDateStr = endDate.toISOString().split('T')[0];

      // Fetch logs and weather for the week
      const logsAndWeather = await fetchLogsAndWeatherForRange(String(id), startDate, endDateStr);
      const days: WeeklyDayData[] = [];
      for (let i = 0; i < 7; i++) {
        const d = new Date(weekStart);
        d.setDate(weekStart.getDate() + i);
        const dateStr = d.toISOString().split('T')[0];
        const weather = logsAndWeather[dateStr]?.weather;
        days.push({
          date: dateStr,
          day: d.toLocaleDateString('en-US', { weekday: 'short' }),
          dayNum: d.getDate(),
          minTemp: weather?.detailedTemps?.min ?? null,
          maxTemp: weather?.detailedTemps?.max ?? null,
          rain: weather?.rainfall ?? null,
          humidity: weather?.humidity ?? null,
          watered: !!history.find(h => h.date === dateStr),
          isToday: d.toDateString() === today.toDateString(),
          plantId: String(id),
          weatherSummary: weather?.weatherSummary,
          detailedTemps: weather?.detailedTemps ? {
            morn: weather.detailedTemps.morn ?? null,
            day: weather.detailedTemps.day ?? null,
            eve: weather.detailedTemps.eve ?? null,
            night: weather.detailedTemps.night ?? null,
            min: weather.detailedTemps.min ?? null,
            max: weather.detailedTemps.max ?? null,
          } : undefined,
        });
      }
      setWeekData(days);
    };
    fetchWeekData();
  }, [plant, history, id]);

  useEffect(() => {
    if (!id || !expandedLogDate) return;
    let cancelled = false;
    setExpandedLogLoading(true);
    (async () => {
      const logs = await fetchPlantLogsForDate(String(id), expandedLogDate);
      if (!cancelled) {
        setDailyLogs((prev) => ({ ...prev, [expandedLogDate]: logs }));
        setExpandedLogLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id, expandedLogDate]);

  useEffect(() => {
    if (!id) return;
    // Fetch progress pics from Firestore (assuming a subcollection 'progressPics' with 'url' field)
    (async () => {
      const picsSnap = await getDocs(collection(db, 'plants', String(id), 'progressPics'));
      setProgressPics(picsSnap.docs.map(doc => doc.data().url).filter(Boolean));
    })();
  }, [id]);

  const handleLogWater = async (date: string) => {
    if (!plant || !id) return;
    try {
      await addPlantLog(String(id), { type: 'watering', description: 'Watered the plant', updatedBy: 'demoUser' }, date);
      const h = await fetchWateringHistory(String(id), DEFAULT_HISTORY_DAYS);
      setHistory(h);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to log watering');
    }
  };

  // Gallery bar height
  const galleryBarAnimatedStyle = useAnimatedStyle(() => {
    const progress = (scrollY.value / maxScroll);
    return {
      position: 'absolute',
      top: insets.top, // Respect safe area
      left: 0,
      right: 0,
      height: galleryBarHeight,
      opacity: progress,
      transform: [{ translateY: interpolate(scrollY.value, [0, maxScroll], [galleryBarHeight, 0], Extrapolate.CLAMP) }],
      zIndex: 10,
      backgroundColor: Colors[theme].background,
      borderBottomWidth: 1,
      borderBottomColor: '#ddd',
      justifyContent: 'center',
    };
  });

  // Compose gallery data: main image first, then progress pics (skip duplicate if main is in progressPics)
  const galleryImages = [
    plant?.imageUri,
    ...progressPics.filter((url) => url && url !== plant?.imageUri),
  ].filter(Boolean);

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
      {/* Collapsing background image */}
      <Animated.View style={animatedBgImageStyle}>
        {plant?.imageUri ? (
          <Image source={{ uri: plant.imageUri }} style={{ width: '100%', height: '100%', resizeMode: 'cover' }} />
        ) : (
          <View style={{ width: '100%', height: '100%', backgroundColor: '#e5e7eb' }} />
        )}
      </Animated.View>
      {/* Animated Gallery Bar */}
      <Animated.View style={galleryBarAnimatedStyle}>
        <FlatList
          data={galleryImages}
          horizontal
          keyExtractor={(item, idx) => (item ? item : 'img') + idx}
          contentContainerStyle={{ paddingHorizontal: 12, alignItems: 'center', height: galleryBarHeight }}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item, index }) => (
            <Image
              source={{ uri: item }}
              style={{
                width: 72,
                height: 72,
                borderRadius: 12,
                marginRight: 14,
                backgroundColor: '#eee',
                borderWidth: index === 0 ? 2 : 0,
                borderColor: index === 0 ? Colors[theme].tint : undefined,
              }}
            />
          )}
        />
      </Animated.View>
      <Animated.ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: HEADER_MAX_HEIGHT + insets.top, // Respect safe area
          minHeight: Dimensions.get('window').height + (HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT),
        }}
        onScroll={onScroll}
        scrollEventThrottle={16}
        bounces={false}
        overScrollMode="never"
      >
        <View style={{ paddingHorizontal: 16 }}>
          <ThemedText type="title">{plant.name}</ThemedText>
          {plant.strain && <ThemedText type="subtitle" style={{ marginBottom: 10 }}>{plant.strain}</ThemedText>}
          {plant.environment === 'outdoor' && weekData.length === 7 && (
            <>
              <WeeklyPlantCalendarBar
                weekData={weekData}
                onLogWater={handleLogWater}
                expandedLogDate={expandedLogDate}
                setExpandedLogDate={setExpandedLogDate}
                getLogsForDate={(date: string) => dailyLogs[date] || []}
                plantId={id}
                uploading={expandedLogLoading}
                onUpdateWeekData={(updater) => setWeekData((prev) => updater([...prev]))}
                // ProgressPicPreview and gallery/add buttons removed below weather bar
              />
              <Button mode="outlined" style={{ marginTop: 10 }} onPress={() => router.push({ pathname: '/plant/LogHistoryCalendar', params: { plantId: String(id) } })}>
                View Full Log Calendar
              </Button>
            </>
          )}
          {plant.notes && (
            <View style={styles.section}>
              <ThemedText type="subtitle">Notes</ThemedText>
              <ThemedText>{plant.notes}</ThemedText>
            </View>
          )}
        </View>
        {/* REMOVE the tall spacer that causes excessive scroll */}
      </Animated.ScrollView>
      <IconButton
        icon="delete"
        mode="contained"
        iconColor={Colors[theme].white}
        containerColor={Colors[theme].tint}
        onPress={confirmDelete}
        style={{ position: 'absolute', top: insets.top + 12, right: 16, zIndex: 30 }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  section: { marginVertical: 10 },
});
