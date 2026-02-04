import { useCallback, useEffect, useState } from 'react';
import { collection, getDocs, query, Timestamp, where } from 'firebase/firestore';
import { db } from '@/services/firebase';
import logger from '@/lib/logger';

type WateredMap = Record<string, boolean>;

async function fetchWateredTodayMap(plantIds: string[]): Promise<WateredMap> {
  if (!plantIds.length) return {};

  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);

  const startTs = Timestamp.fromDate(start);
  const endTs = Timestamp.fromDate(end);

  const statuses = await Promise.all(
    plantIds.map(async (plantId) => {
      try {
        const logsRef = collection(db, 'plants', plantId, 'logs');
        const q = query(
          logsRef,
          where('type', '==', 'watering'),
          where('timestamp', '>=', startTs),
          where('timestamp', '<=', endTs),
        );
        const snap = await getDocs(q);
        return { plantId, watered: !snap.empty };
      } catch (error) {
        logger.error('Failed to fetch watered status', { plantId, error });
        return { plantId, watered: false };
      }
    }),
  );

  return statuses.reduce<WateredMap>((acc, { plantId, watered }) => {
    acc[plantId] = watered;
    return acc;
  }, {});
}

export function usePlantsWateredToday(plantIds: string[]) {
  const [wateredMap, setWateredMap] = useState<WateredMap>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!plantIds.length) {
      setWateredMap({});
      setLoading(false);
      setError(null);
      return;
    }
    setLoading(true);
    try {
      const map = await fetchWateredTodayMap(plantIds);
      setWateredMap(map);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load watering status';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [plantIds]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const markWatered = useCallback((plantId: string) => {
    setWateredMap(prev => ({ ...prev, [plantId]: true }));
  }, []);

  const markManyWatered = useCallback((ids: string[]) => {
    if (!ids.length) return;
    setWateredMap(prev => {
      const next = { ...prev };
      ids.forEach(id => {
        next[id] = true;
      });
      return next;
    });
  }, []);

  return {
    wateredMap,
    loading,
    error,
    refresh,
    markWatered,
    markManyWatered,
    setWateredMap,
  };
}
