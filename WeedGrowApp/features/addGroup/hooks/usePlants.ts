import { useEffect, useState } from 'react';
import { fetchPlants, PlantItem } from '../api/fetchPlants';

export const usePlants = () => {
  const [plants, setPlants] = useState<PlantItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPlants = async () => {
      try {
        const items = await fetchPlants();
        setPlants(items);
      } catch (e: any) {
        setError(e.message || 'Failed to load plants');
      } finally {
        setLoading(false);
      }
    };
    loadPlants();
  }, []);

  return { plants, loading, error };
};
