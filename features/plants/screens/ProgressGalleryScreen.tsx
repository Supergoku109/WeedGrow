import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { useProgressGallery } from '@/features/plants/hooks/useProgressGallery';
import ProgressGallery from '../components/ProgressGallery';

export default function ProgressGalleryScreen() {
  const { plantId } = useLocalSearchParams<{ plantId: string }>();
  const { pics, loading } = useProgressGallery(plantId);

  return <ProgressGallery pics={pics} loading={loading} />;
}
