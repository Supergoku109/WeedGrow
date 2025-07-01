import { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/services/firebase';

/**
 * Hook to determine if all plants in a group have been watered today.
 * @param groupId The group id
 * @param plantIds The array of plant ids in the group
 * @returns { wateredToday: boolean, loading: boolean }
 */
export function useGroupWateredToday(groupId: string, plantIds: string[] = []) {
  const [wateredToday, setWateredToday] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!plantIds.length) {
      setWateredToday(false);
      setLoading(false);
      return;
    }
    let ignore = false;
    async function checkAllWatered() {
      setLoading(true);
      const todayStr = new Date().toISOString().split('T')[0];
      try {
        // For each plant, check if there is a watering log for today
        const results = await Promise.all(
          plantIds.map(async (plantId) => {
            const logsRef = collection(db, 'plants', plantId, 'logs');
            const q = query(
              logsRef,
              where('type', '==', 'watering'),
              where('timestamp', '>=', new Date(todayStr + 'T00:00:00')),
              where('timestamp', '<', new Date(todayStr + 'T23:59:59'))
            );
            const snap = await getDocs(q);
            return !snap.empty;
          })
        );
        if (!ignore) setWateredToday(results.every(Boolean));
      } catch {
        if (!ignore) setWateredToday(false);
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    checkAllWatered();
    return () => { ignore = true; };
  }, [groupId, JSON.stringify(plantIds)]);

  return { wateredToday, loading };
}
