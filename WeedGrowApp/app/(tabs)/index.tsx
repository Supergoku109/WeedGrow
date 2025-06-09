import React, { useEffect, useState } from 'react';
import { StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ActivityIndicator, Snackbar } from 'react-native-paper';

import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import GroupCard from '@/components/GroupCard';
import { getUserGroups, waterAllPlantsInGroup } from '@/lib/groups';
import type { Group } from '@/firestoreModels';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function HomeScreen() {
  const [groups, setGroups] = useState<(Group & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [wateringId, setWateringId] = useState<string | null>(null);
  const [snackVisible, setSnackVisible] = useState(false);
  const [snackMessage, setSnackMessage] = useState('');
  const router = useRouter();
  type Theme = keyof typeof Colors;
  const theme = (useColorScheme() ?? 'dark') as Theme;

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await getUserGroups('demoUser');
        setGroups(data);
      } catch (e: any) {
        console.error('Error fetching groups', e);
        setError(e.message || 'Failed to load groups');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleWaterAll = async (groupId: string) => {
    setWateringId(groupId);
    try {
      await waterAllPlantsInGroup(groupId, 'demoUser');
      setSnackMessage('All plants watered');
    } catch (err: any) {
      setSnackMessage(err.message || 'Failed to log');
    } finally {
      setWateringId(null);
      setSnackVisible(true);
    }
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }
    >
      {loading && (
        <ActivityIndicator style={styles.loading} color={Colors[theme].tint} />
      )}
      {error && <ThemedText>❌ {error}</ThemedText>}
      {!loading && !error && groups.length === 0 && (
        <ThemedText>No groups found.</ThemedText>
      )}
      {!loading && !error && groups.length > 0 && (
        <FlatList
          data={groups}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <GroupCard
              group={item}
              onWaterAll={() => handleWaterAll(item.id)}
              waterDisabled={wateringId === item.id}
            />
          )}
        />
      )}
      <Snackbar
        visible={snackVisible}
        onDismiss={() => setSnackVisible(false)}
        duration={3000}
      >
        {snackMessage}
      </Snackbar>
      <TouchableOpacity
        accessibilityLabel="Add Group"
        onPress={() => router.push('/add-group')}
        style={[styles.fab, { backgroundColor: Colors[theme].tint }]}
      >
        <MaterialCommunityIcons
          name="plus"
          size={28}
          color={Colors[theme].white}
        />
      </TouchableOpacity>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
  loading: {
    marginTop: 20,
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
