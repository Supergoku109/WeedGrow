import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Image,
  Animated,
} from 'react-native';
import { Button, Snackbar } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
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

const GroupCardComponent = function GroupCard({
  group,
  plants: _plants = [],
  weatherData,
  lastWatered,
  onEdit,
}: GroupCardProps) {
  const router = useRouter();
  const [weather, setWeather] = useState<any>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
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

  // Use the plants prop directly
  const previewPlants = _plants.slice(0, 3);
  const moreCount = _plants.length - 3;

  // Long press for quick actions (optional)
  const handleLongPress = () => {
    // You can implement an ActionSheet/modal here for Edit, Delete, Share
    if (onEdit) onEdit();
  };

  const handlePress = () =>
    router.push({ pathname: '/group/[id]', params: { id: group.id } });

  // Local state for water button loading
  const [watering, setWatering] = useState(false);
  const [snackVisible, setSnackVisible] = useState(false);
  const [snackMessage, setSnackMessage] = useState('');
  const handleWaterAll = async (e: any) => {
    e.stopPropagation();
    setWatering(true);
    try {
      await waterAllPlantsInGroup(group.id, 'demoUser');
      setSnackMessage('All plants watered');
      setSnackVisible(true);
    } catch (err: any) {
      setSnackMessage(err?.message || 'Failed to log');
      setSnackVisible(true);
    } finally {
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
    <>
      <TouchableOpacity onPress={handlePress} onLongPress={handleLongPress}>
        <Animated.View style={{
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
        }}>
          <ThemedView style={[styles.card, { flexDirection: 'column', minHeight: 90, padding: 10 }]}> 
            {/* Top Row: Env badge, group name, water button */}
            <View style={styles.topRow}>
              <WeedGrowEnvBadge environment={group.environment} size={16} style={{ marginRight: 8 }} />
              <ThemedText style={styles.groupName} numberOfLines={1}>{group.name}</ThemedText>
              <TouchableOpacity
                onPress={handleWaterAll}
                disabled={watering}
                style={styles.waterButtonCompact}
                accessibilityLabel="Water all plants in group"
              >
                {watering ? (
                  <MaterialCommunityIcons name="loading" size={22} color="#fff" />
                ) : (
                  <MaterialCommunityIcons name="water" size={22} color="#fff" />
                )}
              </TouchableOpacity>
            </View>
            {/* Plant images row under env/name/water */}
            <View style={styles.plantImagesRow}>
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
            {/* Last watered info */}
            {lastWatered && (
              <ThemedText style={styles.lastWatered}>Last watered: {lastWatered}</ThemedText>
            )}
          </ThemedView>
        </Animated.View>
      </TouchableOpacity>
      <Snackbar
        visible={snackVisible}
        onDismiss={() => setSnackVisible(false)}
        duration={3000}
      >
        {snackMessage}
      </Snackbar>
    </>
  );
}

const GroupCard = React.memo(GroupCardComponent);
export default GroupCard;

const styles = StyleSheet.create({
  card: {
    marginBottom: 14,
    padding: 10,
    borderRadius: 16,
    // Add green left border to match PlantCard
    borderLeftWidth: 5,
    borderLeftColor: '#00c853',
    position: 'relative',
    elevation: 2,
    minHeight: 90,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
    gap: 8,
  },
  groupName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    flexShrink: 1,
    marginRight: 8,
  },
  waterButtonCompact: {
    marginLeft: 'auto',
    backgroundColor: '#1e90ff',
    borderRadius: 20,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
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
  plantImagesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 4,
    gap: 4,
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
});
