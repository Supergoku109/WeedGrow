import { useEffect, useState, useCallback } from 'react';
import { Alert, BackHandler } from 'react-native';
import { useRouter } from 'expo-router';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { useFocusEffect } from '@react-navigation/native';
import { db } from '@/services/firebase';
import type { Group, Plant } from '@/firestoreModels';

export function useGroupDetail(groupId?: string) {
  const [group, setGroup] = useState<Group & { id: string } | null>(null);
  const [plants, setPlants] = useState<(Plant & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [editVisible, setEditVisible] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchGroup = async () => {
      if (!groupId) {
        setLoading(false);
        return;
      }
      const ref = doc(db, 'groups', String(groupId));
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const groupData = { id: snap.id, ...(snap.data() as Group) };
        setGroup(groupData);

        if (groupData.plantIds?.length) {
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
  }, [groupId, editVisible]);

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
    useCallback(() => {
      const onBackPress = () => {
        if (editVisible) {
          setEditVisible(false);
          return true;
        }
        router.replace('/');
        return true;
      };
      const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => sub.remove();
    }, [editVisible, router])
  );

  return {
    group,
    plants,
    loading,
    editVisible,
    setEditVisible,
    deleting,
    handleDeleteGroup,
  };
}
