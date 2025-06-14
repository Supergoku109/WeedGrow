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

interface PlantItem extends Plant {
  id: string;
}

export function usePlantList() {
  const [plants, setPlants] = useState<PlantItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [envFilter, setEnvFilter] = useState<string | null>(null);
  const [plantedFilter, setPlantedFilter] = useState<string | null>(null);
  const [trainingFilter, setTrainingFilter] = useState<string | null>(null);
  const [filtersVisible, setFiltersVisible] = useState(false);
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
        setPlants(items);

        await Promise.all(
          items.map(async (p) => {
            if (p.location?.lat && p.location?.lng) {
              try {
                const needsUpdate = await shouldUpdateWeather(p.id);
                if (needsUpdate) {
                  const weatherApiData = await fetchWeather(p.location.lat, p.location.lng);
                  const parsed = parseWeatherData(weatherApiData);
                  await updateWeatherCache(p.id, parsed);
                }
              } catch {}
            }
          })
        );

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
      } catch (e: any) {
        console.error('Error fetching plants:', e);
        setError(e.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchPlants();
  }, []);

  const filteredPlants = plants.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (!statusFilter || p.status === statusFilter) &&
      (!envFilter || p.environment === envFilter) &&
      (!plantedFilter || p.plantedIn === plantedFilter) &&
      (!trainingFilter || (p.trainingTags && p.trainingTags.includes(trainingFilter)))
  );

  return {
    plants,
    filteredPlants,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    filtersVisible,
    setFiltersVisible,
    statusFilter,
    setStatusFilter,
    envFilter,
    setEnvFilter,
    plantedFilter,
    setPlantedFilter,
    trainingFilter,
    setTrainingFilter,
    weatherMap,
  };
}
