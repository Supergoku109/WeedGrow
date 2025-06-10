import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Image, Alert, BackHandler, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActivityIndicator, IconButton } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { doc, getDoc } from 'firebase/firestore';
import { ThemedText } from '@/ui/ThemedText';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { db } from '@/services/firebase';
import type { Group, Plant } from '@/firestoreModels';
import EditGroupModal from '@/features/groups/components/EditGroupModal';
import { useFocusEffect } from '@react-navigation/native';

export default function GroupDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [group, setGroup] = useState<Group & { id: string } | null>(null);
  const [plants, setPlants] = useState<(Plant & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [editVisible, setEditVisible] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const theme = (useColorScheme() ?? 'dark') as keyof typeof Colors;
  const router = useRouter();

  useEffect(() => {
    const fetchGroup = async () => {
      if (!id) return setLoading(false);
      const ref = doc(db, 'groups', String(id));
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const groupData = { id: snap.id, ...(snap.data() as Group) };
        setGroup(groupData);
        // Fetch plants in group
        if (groupData.plantIds && groupData.plantIds.length > 0) {
          // Fix: fetch all plants in group, not just the first
          const plantSnaps = await Promise.all(
            groupData.plantIds.map((pid: string) => getDoc(doc(db, 'plants', pid)))
          );
          setPlants(
            plantSnaps
              .filter((s) => s.exists())
              .map((s) => ({ id: s.id, ...(s.data() as Plant) }))
          );
        } else {
          setPlants([]);
        }
      } else {
        setGroup(null);
        setPlants([]);
      }
      setLoading(false);
    };
    fetchGroup();
  }, [id, editVisible]);

  const handleDeleteGroup = async () => {
    if (!group) return;
    Alert.alert(
      'Delete Group',
      'Are you sure you want to delete this group? This will NOT delete the plants, only the group.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              const { doc, deleteDoc } = await import('firebase/firestore');
              const { db } = await import('@/services/firebase');
              await deleteDoc(doc(db, 'groups', group.id));
              router.replace('/(tabs)');
            } catch (e) {
              Alert.alert('Error', 'Failed to delete group');
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        if (editVisible) {
          setEditVisible(false);
          return true;
        }
        // Always force replace to the Home tab when back is pressed
        router.replace('/');
        return true;
      };
      const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => sub.remove();
    }, [editVisible, router])
  );

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors[theme].background }}>
        <View style={styles.center}><ActivityIndicator color={Colors[theme].tint} /></View>
      </SafeAreaView>
    );
  }
  if (!group) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors[theme].background }}>
        <View style={styles.center}><ThemedText>Group not found.</ThemedText></View>
      </SafeAreaView>
    );
  }

  // TODO: Weather summary, recent activity, notes, etc.

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors[theme].background }}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.headerRow}>
          <MaterialCommunityIcons
            name={group.environment === 'indoor' ? 'home' : group.environment === 'outdoor' ? 'weather-sunny' : 'greenhouse'}
            size={28}
            color={Colors[theme].tint}
            style={{ marginRight: 8 }}
          />
          <ThemedText type="title" style={styles.groupName}>{group.name}</ThemedText>
          <IconButton icon="pencil" onPress={() => setEditVisible(true)} />
          <IconButton icon="delete" onPress={handleDeleteGroup} loading={deleting} disabled={deleting} />
        </View>
        {/* Weather summary (outdoor only) */}
        {/* TODO: Weather summary */}
        {/* Plant list */}
        <ThemedText style={styles.sectionLabel}>Plants in this group</ThemedText>
        <View style={styles.plantList}>
          {plants.map((p) => (
            <TouchableOpacity
              key={p.id}
              style={styles.plantRow}
              onPress={() => router.push({ pathname: '/plant/[id]', params: { id: p.id } })}
              accessibilityLabel={`View details for ${p.name}`}
            >
              {p.imageUri ? (
                <Image source={{ uri: p.imageUri }} style={styles.plantImage} />
              ) : (
                <View style={styles.plantPlaceholder} />
              )}
              <View style={{ flex: 1 }}>
                <ThemedText style={styles.plantName}>{p.name}</ThemedText>
                <ThemedText style={styles.plantStage}>{p.growthStage || 'Unknown stage'}</ThemedText>
              </View>
            </TouchableOpacity>
          ))}
        </View>
        {/* TODO: Recent activity, notes, etc. */}
      </ScrollView>
      <EditGroupModal
        visible={editVisible}
        group={group}
        allPlants={plants}
        onClose={() => setEditVisible(false)}
        onSave={async () => {
          setEditVisible(false);
        }}
        key={editVisible ? group.id : 'hidden'} // Use key that changes with visibility
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 16,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  groupName: {
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
  },
  sectionLabel: {
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  plantList: {
    gap: 8,
  },
  plantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2226',
    borderRadius: 8,
    padding: 8,
  },
  plantImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
    backgroundColor: '#ccc',
  },
  plantPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
    backgroundColor: '#ccc',
  },
  plantName: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  plantStage: {
    fontSize: 13,
    color: '#888',
  },
});
