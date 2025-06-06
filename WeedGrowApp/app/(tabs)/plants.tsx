import React, { useEffect, useState } from 'react';
import { StyleSheet, FlatList, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { PlantCard } from '@/components/PlantCard';
import { collection, getDocs, query } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { Plant } from '@/firestoreModels';
import { ActivityIndicator, Searchbar, Menu, Button } from 'react-native-paper';

interface PlantItem extends Plant {
  id: string;
}

export default function PlantsScreen() {
  const router = useRouter();
  const [plants, setPlants] = useState<PlantItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [envFilter, setEnvFilter] = useState<string | null>(null);
  const [statusMenu, setStatusMenu] = useState(false);
  const [envMenu, setEnvMenu] = useState(false);
  type Theme = keyof typeof Colors;
  const theme = (useColorScheme() ?? 'dark') as Theme;

  useEffect(() => {
    const fetchPlants = async () => {
      try {
        const plantsQuery = query(collection(db, 'plants'));
        const snapshot = await getDocs(plantsQuery);
        const items: PlantItem[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Plant),
        }));
        setPlants(items);
      } catch (e: any) {
        console.error('Error fetching plants:', e);
        setError(e.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchPlants();
  }, []);

  const filteredPlants = plants.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (!statusFilter || p.status === statusFilter) &&
      (!envFilter || p.environment === envFilter)
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: Colors[theme].background }]}>
      <ThemedView style={styles.container}>
        <ThemedText type="title" style={styles.title}>
          My Plants
        </ThemedText>
        <Searchbar
          placeholder="Search plants"
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchBar}
        />
        <View style={styles.filterRow}>
          <Menu
            visible={statusMenu}
            onDismiss={() => setStatusMenu(false)}
            anchor={
              <Button mode="outlined" onPress={() => setStatusMenu(true)}>
                {statusFilter ? statusFilter : 'Status'}
              </Button>
            }
          >
            {['all', 'active', 'archived', 'harvested', 'dead'].map((opt) => (
              <Menu.Item
                key={opt}
                onPress={() => {
                  setStatusFilter(opt === 'all' ? null : opt);
                  setStatusMenu(false);
                }}
                title={opt === 'all' ? 'All' : opt}
              />
            ))}
          </Menu>
          <Menu
            visible={envMenu}
            onDismiss={() => setEnvMenu(false)}
            anchor={
              <Button mode="outlined" onPress={() => setEnvMenu(true)}>
                {envFilter ? envFilter : 'Environment'}
              </Button>
            }
          >
            {['all', 'outdoor', 'greenhouse', 'indoor'].map((opt) => (
              <Menu.Item
                key={opt}
                onPress={() => {
                  setEnvFilter(opt === 'all' ? null : opt);
                  setEnvMenu(false);
                }}
                title={opt === 'all' ? 'All' : opt}
              />
            ))}
          </Menu>
        </View>
        {loading && (
          <ActivityIndicator style={styles.loading} color={Colors[theme].tint} />
        )}
        {error && (
          <ThemedText type="error" style={[styles.errorText, { color: Colors[theme].tint }] }>
            ❌ Error: {error}
          </ThemedText>
        )}
        {!loading && !error && plants.length === 0 && (
          <ThemedText>No plants found.</ThemedText>
        )}
        {!loading && !error && filteredPlants.length > 0 && (
          <FlatList
            data={filteredPlants}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <PlantCard plant={item} />}
          />
        )}
        {!loading && !error && filteredPlants.length === 0 && plants.length > 0 && (
          <ThemedText>No plants match your filters.</ThemedText>
        )}
        <TouchableOpacity
          accessibilityLabel="Add Plant"
          onPress={() => router.push('/add-plant')}
          style={[styles.fab, { backgroundColor: Colors[theme].tint }]}
        >
          <MaterialCommunityIcons name="plus" size={28} color={Colors[theme].white} />
        </TouchableOpacity>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    textAlign: 'center',
    marginBottom: 20,
  },
  loading: {
    marginTop: 20,
  },
  errorText: {
    marginTop: 10,
  },
  searchBar: {
    marginBottom: 12,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
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
