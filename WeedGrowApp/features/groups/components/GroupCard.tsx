import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Image,
  Animated,
} from 'react-native';
import { Button, IconButton, Snackbar } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { ThemedView } from '@/ui/ThemedView';
import { ThemedText } from '@/ui/ThemedText';
import { calendarGreen } from '@/constants/Colors';
import { db } from '@/services/firebase';
import type { Group, Plant } from '@/firestoreModels';
import { WeedGrowEnvBadge } from '@/ui/WeedGrowEnvBadge';
import { waterAllPlantsInGroup } from '@/features/groups/api/groupApi';

export interface GroupCardProps {
  group: Group & { id: string };
  plants?: (Plant & { id: string })[];
  weatherData?: {
    temperature?: number;
    humidity?: number;
  };
  /** Optional label like "2 days ago" */
  lastWatered?: string;
  onEdit?: () => void;
}

export default function GroupCard({
  group,
  plants = [],
  weatherData,
  lastWatered,
  onEdit,
}: GroupCardProps) {
  const router = useRouter();
  const [weather, setWeather] = useState<any>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [watering, setWatering] = useState(false);
  const [snackVisible, setSnackVisible] = useState(false);
  const [snackMessage, setSnackMessage] = useState('');

  useEffect(() => {
    let ignore = false;
    async function fetchWeather() {
      if (group.environment !== 'outdoor' || !group.plantIds?.length) {
        setWeather(null);
        return;
      }
      setWeatherLoading(true);
      try {
        const today = new Date().toISOString().split('T')[0];
        const { doc, getDoc } = await import('firebase/firestore');
        const { db } = await import('@/services/firebase');
        const ref = doc(db, 'plants', group.plantIds[0], 'weatherCache', today);
        const snap = await getDoc(ref);
        if (!ignore) setWeather(snap.exists() ? snap.data() : null);
      } catch {
        if (!ignore) setWeather(null);
      } finally {
        if (!ignore) setWeatherLoading(false);
      }
    }
    fetchWeather();
    return () => { ignore = true; };
  }, [group.environment, group.plantIds]);

  // Sensor profile readings for indoor/greenhouse
  const [sensorReadings, setSensorReadings] = useState<{ temp?: number; humidity?: number; missing?: boolean; name?: string }>({});
  useEffect(() => {
    if (group.environment === 'indoor' || group.environment === 'greenhouse') {
      let ignore = false;
      async function fetchSensorProfile() {
        if (group.sensorProfileId) {
          try {
            const snap = await getDoc(doc(db, 'sensorProfiles', group.sensorProfileId));
            if (snap.exists()) {
              const data = snap.data();
              if (!ignore) setSensorReadings({ temp: data.defaultTemp, humidity: data.defaultHumidity, name: data.name });
            } else {
              if (!ignore) setSensorReadings({ missing: true });
            }
          } catch {
            if (!ignore) setSensorReadings({ missing: true });
          }
        } else {
          setSensorReadings({});
        }
      }
      fetchSensorProfile();
      return () => { ignore = true; };
    } else {
      setSensorReadings({});
    }
  }, [group.environment, group.sensorProfileId]);

  // Environment badge
  const envIcon =
    group.environment === 'indoor'
      ? 'home'
      : group.environment === 'outdoor'
      ? 'weather-sunny'
      : 'greenhouse';
  const envLabel =
    group.environment === 'indoor'
      ? 'Indoor'
      : group.environment === 'outdoor'
      ? 'Outdoor'
      : 'Greenhouse';

  // Plant preview
  const previewPlants = plants.slice(0, 3);
  const moreCount = plants.length - 3;

  // Long press for quick actions (optional)
  const handleLongPress = () => {
    // You can implement an ActionSheet/modal here for Edit, Delete, Share
    if (onEdit) onEdit();
  };

  const handlePress = () =>
    router.push({ pathname: '/group/[id]', params: { id: group.id } });

  const handleWaterAll = async (e: any) => {
    e.stopPropagation();
    setWatering(true);
    try {
      await waterAllPlantsInGroup(group.id, 'demoUser');
      setSnackMessage('All plants watered!');
    } catch (err: any) {
      setSnackMessage(err?.message || 'Failed to water all');
    } finally {
      setSnackVisible(true);
      setWatering(false);
    }
  };

  const handleEdit = (e: any) => {
    e.stopPropagation();
    onEdit?.();
  };

  // Mount animation (same as PlantCard)
  const scaleAnim = React.useRef(new Animated.Value(0.92)).current;
  const opacityAnim = React.useRef(new Animated.Value(0)).current;
  React.useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        friction: 7,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <TouchableOpacity onPress={handlePress} onLongPress={handleLongPress}>
      <Animated.View style={{
        transform: [{ scale: scaleAnim }],
        opacity: opacityAnim,
      }}>
        <View style={styles.card}>
          {/* Green accent bar on the left */}
          <View style={styles.greenBar} />
          <View style={{ flex: 1 }}>
            {/* Header: Env badge + name horizontally */}
            <View style={styles.headerRow}>
              <WeedGrowEnvBadge environment={group.environment} size={16} style={{ marginRight: 8 }} />
              <ThemedText style={styles.groupName} numberOfLines={1}>{group.name}</ThemedText>
            </View>
            {/* Weather info (outdoor only) */}
            {group.environment === 'outdoor' && (
              <View style={styles.weatherRow}>
                {weatherLoading ? (
                  <ThemedText>Loading weather...</ThemedText>
                ) : weather ? (
                  <>
                    <ThemedText style={styles.weatherStat}>
                      🌡️ {weather.temperature}°C
                    </ThemedText>
                    <ThemedText style={styles.weatherStat}>
                      💧 {weather.humidity}%
                    </ThemedText>
                    <ThemedText style={styles.weatherStat}>
                      ☔ {Math.round((weather.pop ?? 0) * 100)}%
                    </ThemedText>
                  </>
                ) : (
                  <ThemedText>No weather data</ThemedText>
                )}
              </View>
            )}
            {/* Sensor profile readings for indoor/greenhouse */}
            {(group.environment === 'indoor' || group.environment === 'greenhouse') && (
              <View style={styles.weatherRow}>
                {group.sensorProfileId ? (
                  sensorReadings.missing ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 12 }}>
                      <MaterialCommunityIcons name="alert-circle-outline" color="#fff" size={16} />
                      <ThemedText style={styles.weatherStat}> No profile </ThemedText>
                    </View>
                  ) : (
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 12 }}>
                      <MaterialCommunityIcons name="thermometer" color="#fff" size={16} />
                      <ThemedText style={styles.weatherStat}> {sensorReadings.temp ?? '--'}°C </ThemedText>
                      <MaterialCommunityIcons name="water-percent" color="#fff" size={16} />
                      <ThemedText style={styles.weatherStat}> {sensorReadings.humidity ?? '--'}%</ThemedText>
                      <ThemedText style={styles.weatherStat}>
                        Sensor: {sensorReadings.missing ? '--' : (sensorReadings.name || 'Profile')}
                      </ThemedText>
                    </View>
                  )
                ) : (
                  <ThemedText>No sensor profile linked</ThemedText>
                )}
              </View>
            )}
            {/* Plant preview */}
            <View style={styles.plantsRow}>
              {previewPlants.map((p) =>
                p.imageUri ? (
                  <Image
                    key={p.id}
                    source={{ uri: p.imageUri }}
                    style={styles.plantImage}
                    accessibilityLabel={`${p.name} image`}
                  />
                ) : (
                  <View key={p.id} style={styles.plantPlaceholder}>
                    <ThemedText style={styles.plantPlaceholderText}>{p.name}</ThemedText>
                  </View>
                )
              )}
              {moreCount > 0 && (
                <ThemedText style={styles.moreText}>+{moreCount}</ThemedText>
              )}
            </View>
            {/* Last watered info */}
            {lastWatered && (
              <ThemedText style={styles.lastWatered}>Last watered: {lastWatered}</ThemedText>
            )}
          </View>
          {/* Water All button on the right */}
          <View style={styles.waterButtonSection}>
            <IconButton
              icon="water"
              size={24}
              mode="contained"
              iconColor="#fff"
              containerColor="#1e90ff"
              style={[styles.waterButtonCompact, { borderRadius: 24, backgroundColor: '#1e90ff' }]}
              onPress={handleWaterAll}
              accessibilityLabel="Water all plants in group"
              disabled={watering}
            />
          </View>
        </View>
      </Animated.View>
      <Snackbar
        visible={snackVisible}
        onDismiss={() => setSnackVisible(false)}
        duration={3000}
      >
        {snackMessage}
      </Snackbar>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 14,
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#181f1b',
    position: 'relative',
    elevation: 2,
    flexDirection: 'row',
    alignItems: 'stretch',
    minHeight: 90,
    overflow: 'hidden',
  },
  greenBar: {
    width: 6,
    backgroundColor: '#00c853',
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
    marginRight: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 6,
  },
  groupName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    flexShrink: 1,
  },
  weatherRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
  },
  weatherStat: {
    color: '#fff',
    fontSize: 14,
    marginRight: 8,
  },
  plantsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 4,
  },
  plantImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 4,
  },
  plantPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ccc',
  },
  plantPlaceholderText: {
    fontSize: 10,
    textAlign: 'center',
  },
  moreText: {
    marginLeft: 4,
    color: '#fff',
    fontWeight: 'bold',
  },
  lastWatered: {
    marginTop: 4,
    color: '#fff',
    fontSize: 13,
  },
  waterButtonSection: {
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'stretch',
    paddingHorizontal: 4,
    marginLeft: 8,
  },
  waterButtonCompact: {
    alignSelf: 'center',
    borderRadius: 8,
    backgroundColor: '#2563eb',
    paddingHorizontal: 16,
    paddingVertical: 8,
    elevation: 2,
  },
});
