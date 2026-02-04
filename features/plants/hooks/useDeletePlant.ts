import { useCallback } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { deletePlantAndSubcollections } from '../api/plantService';

export function useDeletePlant(id?: string, router?: ReturnType<typeof useRouter>) {
  const internalRouter = useRouter();
  const activeRouter = router ?? internalRouter;
  const onDelete = useCallback(() => {
    if (!id) return;

    Alert.alert('Delete Plant', 'Are you sure you want to delete this plant?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deletePlantAndSubcollections(id);
            activeRouter.replace('/(tabs)?tabIndex=1'); // Go to home with plants tab active
          } catch (e) {
            console.error('Error deleting plant:', e);
          }
        }
      }
    ]);
  }, [id, activeRouter]);

  return { onDelete };
}
