import React, { useEffect, useState } from 'react';
import { StyleSheet, FlatList, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ActivityIndicator, Snackbar } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/ui/ThemedText';
import GroupCard from '@/features/groups/components/GroupCard';
import EditGroupModal from '@/features/groups/components/EditGroupModal';
import { getUserGroups, waterAllPlantsInGroup } from '@/features/groups/api/groupApi';
import type { Group } from '@/firestoreModels';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { collection, getDocs, query } from 'firebase/firestore';
import { db } from '@/services/firebase';
import type { Plant } from '@/firestoreModels';

export default function HomeScreen() {
  const [groups, setGroups] = useState<(Group & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [wateringId, setWateringId] = useState<string | null>(null);
  const [snackVisible, setSnackVisible] = useState(false);
  const [snackMessage, setSnackMessage] = useState('');
  const [editGroup, setEditGroup] = useState<Group & { id: string } | null>(null);
  const [allPlants, setAllPlants] = useState<(Plant & { id: string })[]>([]);
  const router = useRouter();
  type Theme = keyof typeof Colors;
  const theme = (useColorScheme() ?? 'dark') as Theme;
  const insets = useSafeAreaInsets();

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

  useEffect(() => {
    // Fetch all plants for edit modal
    const fetchPlants = async () => {
      try {
        const q = query(collection(db, 'plants'));
        const snap = await getDocs(q);
        setAllPlants(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Plant) })));
      } catch (e) {
        // ignore
      }
    };
    fetchPlants();
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
    <View style={{ flex: 1, backgroundColor: Colors[theme].background, paddingTop: insets.top }}>
      <View style={styles.homeHeader}>
        <ThemedText type="title" style={styles.homeTitle}>Plant Groups</ThemedText>
        <ThemedText style={styles.homeWelcome}>
          Your grow spaces at a glance. Tap + to add a group.
        </ThemedText>
      </View>
      <FlatList
        // ListHeaderComponent removed to eliminate blue background and default React logo
        data={groups}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator style={styles.loading} color={Colors[theme].tint} />
          ) : error ? (
            <ThemedText>❌ {error}</ThemedText>
          ) : (
            <ThemedText>No groups found.</ThemedText>
          )
        }
        renderItem={({ item }) => (
          <GroupCard
            group={item}
            onWaterAll={() => handleWaterAll(item.id)}
            waterDisabled={wateringId === item.id}
            onEdit={() => setEditGroup(item)}
          />
        )}
      contentContainerStyle={{
        paddingHorizontal: 16,
        paddingTop: insets.top + 16,
        paddingBottom: 32,
        gap: 12,
        flexGrow: 1,
      }}
      />
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
      <EditGroupModal
        visible={!!editGroup}
        group={editGroup as any}
        allPlants={allPlants}
        onClose={() => setEditGroup(null)}
        onSave={async () => {
          setLoading(true);
          const data = await getUserGroups('demoUser');
          setGroups(data);
          setLoading(false);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
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
  homeHeader: {
    alignItems: 'center',
    marginBottom: 4, // was 18, reduce to tighten gap below header
    marginTop: 8,
  },
  homeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4caf50',
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 0, // was 6, reduce to tighten gap between title and subtitle
  },
  homeWelcome: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8, // was 18, reduce to tighten gap below subtitle
    marginHorizontal: 8,
  },
});
