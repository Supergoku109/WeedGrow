import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from '@/ui/ThemedText';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { db } from '@/services/firebase';
import { doc, getDoc } from 'firebase/firestore';

interface SensorProfileBarProps {
  sensorProfileId: string;
}

export default function SensorProfileBar({ sensorProfileId }: SensorProfileBarProps) {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    async function fetchProfile() {
      setLoading(true);
      setError(null);
      try {
        const snap = await getDoc(doc(db, 'sensorProfiles', sensorProfileId));
        if (!ignore) {
          if (snap.exists()) {
            setProfile(snap.data());
          } else {
            setProfile(null);
            setError('Profile not found');
          }
        }
      } catch (e) {
        if (!ignore) setError('Failed to load profile');
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    if (sensorProfileId) fetchProfile();
    return () => { ignore = true; };
  }, [sensorProfileId]);

  if (loading) return <ThemedText>Loading sensor data...</ThemedText>;
  if (error) return <ThemedText>{error}</ThemedText>;
  if (!profile) return <ThemedText>No sensor profile linked</ThemedText>;

  return (
    <View style={styles.row}>
      <MaterialCommunityIcons name="thermometer" color="#fff" size={18} />
      <ThemedText style={styles.stat}>{profile.defaultTemp ?? '--'}°C</ThemedText>
      <MaterialCommunityIcons name="water-percent" color="#fff" size={18} />
      <ThemedText style={styles.stat}>{profile.defaultHumidity ?? '--'}%</ThemedText>
      <ThemedText style={styles.stat}>
        {profile.name ? `Sensor: ${profile.name}` : null}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
  },
  stat: {
    color: '#fff',
    fontSize: 14,
    marginRight: 8,
  },
});
