import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Image, Alert } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ActivityIndicator, IconButton } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Animated from 'react-native-reanimated';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { Plant } from '@/firestoreModels';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { db } from '../../services/firebase';
import { List } from 'react-native-paper';

export default function PlantDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [plant, setPlant] = useState<Plant | null>(null);
  const [loading, setLoading] = useState(true);
  type Theme = keyof typeof Colors;
  const theme = (useColorScheme() ?? 'dark') as Theme;
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const confirmDelete = () => {
    Alert.alert(
      'Delete Plant',
      'Are you sure you want to delete this plant? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              if (id) {
                await deleteDoc(doc(db, 'plants', String(id)));
              }
              router.replace('/(tabs)/plants');
            } catch (e) {
              console.error('Error deleting plant:', e);
            }
          },
        },
      ],
    );
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
      <IconButton
        icon="delete"
        mode="contained"
        iconColor={Colors[theme].white}
        containerColor={Colors[theme].tint}
        onPress={confirmDelete}
        style={[styles.deleteButton, { top: insets.top + 4 }]}
        accessibilityLabel="Delete Plant"
      />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
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
    </SafeAreaView>
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
  deleteButton: {
    position: 'absolute',
    left: 16,
    zIndex: 10,
  },
});
