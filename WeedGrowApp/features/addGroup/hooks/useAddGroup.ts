import { useState } from 'react';
import { useRouter } from 'expo-router';
import { usePlants } from '@/features/addGroup/hooks/usePlants';
import { createGroup } from '@/features/groups/api/groupApi'; // <-- Use the correct API

// Use the same user ID as the home screen
const CURRENT_USER_ID = 'demoUser';

export function useAddGroup() {
  const router = useRouter();
  const { plants, loading, error } = usePlants();
  const [selectedPlantIds, setSelectedPlantIds] = useState<string[]>([]);
  const [groupLocationPlantId, setGroupLocationPlantId] = useState<string | null>(null);
  const [groupName, setGroupName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleTogglePlant = (id: string) => {
    setSelectedPlantIds((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
    );
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim() || selectedPlantIds.length === 0) {
      alert('Please enter a group name and select at least one plant.');
      return;
    }
    setSubmitting(true);
    try {
      const environment = plants.find(p => p.id === selectedPlantIds[0])?.environment;
      if (!environment) {
        alert('Could not determine environment from selected plants.');
        setSubmitting(false);
        return;
      }
      await createGroup({
        name: groupName.trim(),
        plantIds: selectedPlantIds,
        environment,
        location: null, // or use groupLocationPlantId if you have location logic
        createdBy: CURRENT_USER_ID,
      });
      router.back();
    } catch (e) {
      alert('Failed to create group.');
    } finally {
      setSubmitting(false);
    }
  };

  return {
    plants,
    loading,
    error,
    selectedPlantIds,
    setSelectedPlantIds,
    groupLocationPlantId,
    setGroupLocationPlantId,
    groupName,
    setGroupName,
    submitting,
    handleTogglePlant,
    handleCreateGroup,
  };
}
