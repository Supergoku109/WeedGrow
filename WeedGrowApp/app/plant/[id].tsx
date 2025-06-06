import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Image, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import Animated from 'react-native-reanimated';
import { doc, getDoc } from 'firebase/firestore';
import { Plant } from '@/firestoreModels';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { db } from '../../services/firebase';
import { List } from 'react-native-paper';

export default function PlantDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [plant, setPlant] = useState<Plant | null>(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <ThemedView style={styles.center}>
        <ActivityIndicator />
      </ThemedView>
    );
  }

  if (!plant) {
    return (
      <ThemedView style={styles.center}>
        <ThemedText>Plant not found.</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      {plant.imageUri && (
        <Animated.View sharedTransitionTag={`plant.${id}.photo`} style={styles.imageWrapper}>
          <Image source={{ uri: plant.imageUri }} style={styles.image} />
        </Animated.View>
      )}
      <ThemedText type="title" style={styles.title}>{plant.name}</ThemedText>
      <ThemedText style={styles.strain}>{plant.strain}</ThemedText>

      <View style={styles.section}>
        <List.Item
          title="Growth Stage"
          description={plant.growthStage}
          left={props => <List.Icon {...props} icon="sprout" />}
        />
        <List.Item
          title="Environment"
          description={plant.environment}
          left={props => <List.Icon {...props} icon={plant.environment === 'indoor' ? 'home' : plant.environment === 'greenhouse' ? 'greenhouse' : 'tree'} />}
        />
        <List.Item
          title="Status"
          description={plant.status}
          left={props => <List.Icon {...props} icon={plant.status === 'active' ? 'check-circle-outline' : plant.status === 'archived' ? 'archive' : plant.status === 'harvested' ? 'flower' : 'skull'} />}
        />
      </View>

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
    </ScrollView>
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
  section: {
    marginTop: 16,
    gap: 4,
  },
});
