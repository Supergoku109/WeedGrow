// features/plants/hooks/usePlantList.ts

import { useEffect, useState } from 'react';
import { Plant } from '@/firestoreModels';
import { PlantAdviceContext } from '@/lib/weather/getPlantAdvice';
import { collection, getDocs, query } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { fetchPlantWeatherContext } from '@/lib/weather/fetchPlantWeatherContext';
import { FirebaseError } from 'firebase/app';

interface PlantItem extends Plant {
  id: string;
}

const plantCache: { plants: PlantItem[] | null; weatherMap: Record<string, PlantAdviceContext | undefined>; } = {
  plants: null,
  weatherMap: {},
};

export function usePlantList() {
  const [plants, setPlants] = useState<PlantItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [weatherMap, setWeatherMap] = useState<Record<string, PlantAdviceContext | undefined>>({});

  useEffect(() => {
    const fetchPlants = async () => {
      try {
        if (plantCache.plants) {
          // Use cached data if available
          setPlants(plantCache.plants);
          setWeatherMap(plantCache.weatherMap);
          setLoading(false);
          return;
        }

        const plantsQuery = query(collection(db, 'plants'));
        const snapshot = await getDocs(plantsQuery);
        const items: PlantItem[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Plant),
        }));

        setPlants(items);
        plantCache.plants = items;

        const weatherResults = await Promise.all(
          items.map(async (p) => {
            try {
              return await fetchPlantWeatherContext(p.id);
            } catch {
              return undefined;
            }
          })
        );

        const map: Record<string, PlantAdviceContext | undefined> = {};
        items.forEach((p, idx) => {
          map[p.id] = weatherResults[idx];
        });

        setWeatherMap(map);
        plantCache.weatherMap = map;
      } catch (e: any) {
        setError(e.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchPlants();
  }, []);

  return {
    plants,
    loading,
    error,
    weatherMap,
    isDataReady: !loading && plants.length > 0,
  };
}
