// features/plants/hooks/usePlantList.ts

import React, { useEffect, useState } from 'react';
import { Plant } from '@/firestoreModels';
import { PlantAdviceContext } from '@/lib/weather/getPlantAdvice';
import { collection, getDocs, query } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { fetchPlantWeatherContext } from '@/lib/weather/fetchPlantWeatherContext';
import { FirebaseError } from 'firebase/app';

interface PlantItem extends Plant {
  id: string;
}

// Global cache to persist across component unmounts/remounts
const globalPlantCache: { 
  plants: PlantItem[] | null; 
  weatherMap: Record<string, PlantAdviceContext | undefined>; 
  isLoading: boolean;
  fetchPromise: Promise<void> | null;
} = {
  plants: null,
  weatherMap: {},
  isLoading: false,
  fetchPromise: null,
};

// Helper functions to manage cache
export const invalidatePlantCache = () => {
  globalPlantCache.plants = null;
  globalPlantCache.weatherMap = {};
  globalPlantCache.isLoading = false;
  globalPlantCache.fetchPromise = null;
};

export const refreshPlantCache = async () => {
  invalidatePlantCache();
  // The next usePlantList hook that runs will fetch fresh data
};

export function usePlantList() {
  const [plants, setPlants] = useState<PlantItem[]>(globalPlantCache.plants || []);
  // Only show loading if we don't have cached data AND we're not already loading
  const [loading, setLoading] = useState(
    !globalPlantCache.plants && !globalPlantCache.isLoading
  );
  const [error, setError] = useState<string | null>(null);
  const [weatherMap, setWeatherMap] = useState<Record<string, PlantAdviceContext | undefined>>(globalPlantCache.weatherMap);

  useEffect(() => {
    // If we already have cached data, use it immediately and don't show loading
    if (globalPlantCache.plants) {
      console.log('Using cached plants data');
      setPlants(globalPlantCache.plants);
      setWeatherMap(globalPlantCache.weatherMap);
      setLoading(false);
      return;
    }

    // If we're already fetching, wait for the existing promise
    if (globalPlantCache.isLoading && globalPlantCache.fetchPromise) {
      console.log('Waiting for existing fetch to complete');
      setLoading(true);
      globalPlantCache.fetchPromise.then(() => {
        setPlants(globalPlantCache.plants || []);
        setWeatherMap(globalPlantCache.weatherMap);
        setLoading(false);
      }).catch((e) => {
        console.error('Error waiting for fetch:', e);
        setError(e.message || 'Unknown error');
        setLoading(false);
      });
      return;
    }    // Start fresh fetch
    const fetchPlants = async () => {
      globalPlantCache.isLoading = true;
      try {
        console.log('Fetching plants...');
        const plantsQuery = query(collection(db, 'plants'));
        const snapshot = await getDocs(plantsQuery);
        const items: PlantItem[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Plant),
        }));

        console.log('Fetched plants:', items);
        setPlants(items);
        globalPlantCache.plants = items;

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

        console.log('Fetched weather data:', map);
        setWeatherMap(map);
        globalPlantCache.weatherMap = map;
      } catch (e: any) {
        console.error('Error fetching plants:', e);
        setError(e.message || 'Unknown error');
      } finally {
        setLoading(false);
        globalPlantCache.isLoading = false;
        globalPlantCache.fetchPromise = null;
      }
    };    // Store the fetch promise to prevent duplicate fetches
    globalPlantCache.fetchPromise = fetchPlants();
  }, []);

  return {
    plants,
    loading,
    error,
    weatherMap,
    isDataReady: !loading && plants.length > 0,
  };
}
