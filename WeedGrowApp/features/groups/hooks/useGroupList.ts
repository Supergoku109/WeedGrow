import { useEffect, useState } from 'react';
import { getUserGroups, waterAllPlantsInGroup } from '@/features/groups/api/groupApi';
import { collection, getDocs, query } from 'firebase/firestore';
import { db } from '@/services/firebase';
import type { Group, Plant } from '@/firestoreModels';

export function useGroupList() {
  const [groups, setGroups] = useState<(Group & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [wateringId, setWateringId] = useState<string | null>(null);
  const [snackVisible, setSnackVisible] = useState(false);
  const [snackMessage, setSnackMessage] = useState('');
  const [editGroup, setEditGroup] = useState<Group & { id: string } | null>(null);
  const [allPlants, setAllPlants] = useState<(Plant & { id: string })[]>([]);

  useEffect(() => {
    const fetchGroups = async () => {
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
    fetchGroups();
  }, []);

  useEffect(() => {
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

  const reloadGroups = async () => {
    setLoading(true);
    const data = await getUserGroups('demoUser');
    setGroups(data);
    setLoading(false);
  };

  return {
    groups,
    loading,
    error,
    wateringId,
    handleWaterAll,
    snackVisible,
    setSnackVisible,
    snackMessage,
    editGroup,
    setEditGroup,
    reloadGroups,
    allPlants,
  };
}
