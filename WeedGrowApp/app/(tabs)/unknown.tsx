import React, { useEffect, useState } from 'react';
import { StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { PlantCard } from '@/components/PlantCard';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { Plant } from '@/firestoreModels';
import { ActivityIndicator } from 'react-native-paper';

interface PlantItem extends Plant {
  id: string;
}

export default function UnknownScreen() {
  const [plants, setPlants] = useState<PlantItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlants = async () => {
      try {
        const userId = 'testUser123';
        const plantsQuery = query(
          collection(db, 'plants'),
          where('owners', 'array-contains', userId)
        );
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <ThemedView style={styles.container}>
        <ThemedText type="title" style={styles.title}>
          My Plants
        </ThemedText>
        {loading && <ActivityIndicator style={styles.loading} />}
        {error && (
          <ThemedText type="error" style={styles.errorText}>
            ❌ Error: {error}
          </ThemedText>
        )}
        {!loading && !error && plants.length === 0 && (
          <ThemedText>No plants found.</ThemedText>
        )}
        {!loading && !error && plants.length > 0 && (
          <FlatList
            data={plants}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <PlantCard plant={item} />}
          />
        )}
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000',
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
    color: 'red',
    marginTop: 10,
  },
});
