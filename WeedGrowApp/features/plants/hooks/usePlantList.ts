// features/plants/hooks/usePlantList.ts

import { useEffect, useState } from 'react';
import { Plant } from '@/firestoreModels';
import { PlantAdviceContext } from '@/lib/weather/getPlantAdvice';
import { collection, getDocs, query } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { fetchPlantWeatherContext } from '@/lib/weather/fetchPlantWeatherContext';
import { fetchWeather } from '@/lib/weather/fetchWeather';
import { updateWeatherCache } from '@/lib/weather/updateFirestore';
import { parseWeatherData } from '@/lib/weather/parseWeatherData';
import { shouldUpdateWeather } from '@/lib/weather/shouldUpdateWeather';
import { FirebaseError } from 'firebase/app';

interface PlantItem extends Plant {
  id: string;
}

const plantCache: { plants: PlantItem[] | null; weatherMap: Record<string, PlantAdviceContext | undefined>; } = {
  plants: null,
  weatherMap: {},
};

// Introduce a delay in updating the plants state
export function usePlantList() {
  const [plants, setPlants] = useState<PlantItem[]>([]); // Start with empty array
  const [loading, setLoading] = useState(true); // Always start in loading state
  const [error, setError] = useState<string | null>(null);
  const [weatherMap, setWeatherMap] = useState<Record<string, PlantAdviceContext | undefined>>({});

  useEffect(() => {
    const fetchPlants = async () => {
      try {
        const plantsQuery = query(collection(db, 'plants'));
        const snapshot = await getDocs(plantsQuery);
        const items: PlantItem[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Plant),
        }));

        // Delay updating state to allow animation setup
        setTimeout(() => {
          setPlants(items);
          plantCache.plants = items; // Update cache
        }, 500); // Delay by 500ms

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
        plantCache.weatherMap = map; // Update cache
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
  };
}
