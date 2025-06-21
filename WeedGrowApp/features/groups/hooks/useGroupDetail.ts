/**
 * Hook for managing group details screen state and operations
 */
import { useEffect, useState, useCallback } from 'react';
import { Alert, BackHandler } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/services/firebase';
import type { Group, Plant } from '@/firestoreModels';
import { deleteGroup, getGroupById, GroupWithId } from '../api/groupApi';

export type PlantWithId = Plant & { id: string };

/**
 * Hook that manages the state and operations for the group detail screen
 * @param groupId - ID of the group to display
 * @returns Object containing group data, plants, loading state, and actions
 */
export function useGroupDetail(groupId?: string) {
  // State
  const [group, setGroup] = useState<GroupWithId | null>(null);
  const [plants, setPlants] = useState<PlantWithId[]>([]);
  const [loading, setLoading] = useState(true);
  const [editVisible, setEditVisible] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  /**
   * Fetches the group and associated plant data
   */
  const fetchGroupData = useCallback(async () => {
    if (!groupId) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      
      // Attempt to get group data first
      const groupData = await getGroupById(String(groupId));
      
      if (!groupData) {
        setGroup(null);
        setPlants([]);
        return;
      }
      
      setGroup(groupData);

      // If group has plants, fetch their data
      if (groupData.plantIds?.length) {
        const plantSnaps = await Promise.all(
          groupData.plantIds.map((pid: string) => getDoc(doc(db, 'plants', pid)))
        );
        
        const plantsData = plantSnaps
          .filter((s) => s.exists())
          .map((s) => ({ id: s.id, ...(s.data() as Plant) }));
          
        setPlants(plantsData);
      } else {
        setPlants([]);
      }
    } catch (error) {
      console.error('Error fetching group details:', error);
      Alert.alert('Error', 'Failed to load group details');
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  // Fetch group data initially and when edit modal is closed
  useEffect(() => {
    fetchGroupData();
  }, [fetchGroupData, editVisible]);

  /**
   * Handles group deletion with confirmation dialog
   */
  const handleDeleteGroup = useCallback(async () => {
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
              await deleteGroup(group.id);
              router.replace('/(tabs)');
            } catch (error) {
              console.error('Error deleting group:', error);
              Alert.alert('Error', 'Failed to delete group');
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  }, [group, router]);

  // Handle back button navigation
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (editVisible) {
          setEditVisible(false);
          return true; // Prevent default behavior
        }
        router.replace('/');
        return true; // Prevent default behavior
      };
      
      const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => sub.remove();
    }, [editVisible, router])
  );
  /**
   * Refreshes the group data
   */
  const refreshGroup = useCallback(() => {
    fetchGroupData();
  }, [fetchGroupData]);

  return {
    group,
    plants,
    loading,
    editVisible,
    setEditVisible,
    deleting,
    handleDeleteGroup,
    refreshGroup,
  };
}
