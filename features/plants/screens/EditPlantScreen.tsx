import React from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import LoadingView from '../components/LoadingView';
import NotFoundView from '../components/NotFoundView';
import { usePlant } from '../hooks/usePlant';
import EditPlantModal from '../components/EditPlantModal';

export default function EditPlantScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { plant, loading } = usePlant(id);

  if (loading) return <LoadingView />;
  if (!plant || !id) return <NotFoundView />;

  return (
    <EditPlantModal
      visible
      plant={plant}
      plantId={String(id)}
      onClose={() => router.back()}
    />
  );
}
