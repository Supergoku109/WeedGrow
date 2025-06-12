import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Image,
  Animated,
} from 'react-native';
import { Button } from 'react-native-paper';
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

export interface GroupCardProps {
  group: Group & { id: string };
  plants?: (Plant & { id: string })[];
  weatherData?: {
    temperature?: number;
    humidity?: number;
  };
  /** Optional label like "2 days ago" */
  lastWatered?: string;
  onWaterAll?: () => void;
  waterDisabled?: boolean;
  onEdit?: () => void;
}

export default function GroupCard({
  group,
  plants = [],
  weatherData,
  lastWatered,
  onWaterAll,
  waterDisabled = false,
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

  const handleWaterAll = (e: any) => {
    e.stopPropagation();
    onWaterAll?.();
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
        <ThemedView style={styles.card}>
          <LinearGradient
            colors={["#00c853", "#151718"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[StyleSheet.absoluteFillObject, { borderRadius: 16 }]}
          />
          <View style={styles.headerRow}>
            <WeedGrowEnvBadge environment={group.environment} size={16} style={{ marginRight: 10 }} />
            {onWaterAll && (
              <Button
                icon="water"
                mode="contained"
                onPress={onWaterAll}
                disabled={waterDisabled}
                style={styles.waterButtonTopRight}
                labelStyle={{ color: '#fff', fontSize: 16 }}
              >
                Water All
              </Button>
            )}
          </View>
          <ThemedText style={styles.groupName}>{group.name}</ThemedText>
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
        </ThemedView>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 20, // match PlantCard
    padding: 16,
    borderRadius: 16,
    backgroundColor: calendarGreen,
    position: 'relative',
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    justifyContent: 'flex-start',
  },
  groupName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#fff',
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
  waterButtonTopRight: {
    marginLeft: 'auto',
    borderRadius: 8,
    backgroundColor: '#2563eb',
    paddingHorizontal: 20, // increased for more text space
    paddingVertical: 8,   // increased for better height
    alignSelf: 'flex-end',
    // height: 36, // removed fixed height for natural sizing
  },
});
