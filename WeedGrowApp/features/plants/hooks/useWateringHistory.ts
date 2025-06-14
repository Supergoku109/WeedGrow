import { useState, useEffect } from 'react';
import { Plant } from '@/firestoreModels';
import { fetchWateringHistory, DEFAULT_HISTORY_DAYS, WateringHistoryEntry } from '@/lib/logs/fetchWateringHistory';

export function useWateringHistory(plant: Plant | null, id?: string) {
  const [history, setHistory] = useState<WateringHistoryEntry[]>([]);

  useEffect(() => {
    if (!plant || !id) return;

    const fetch = async () => {
      const h = await fetchWateringHistory(String(id), DEFAULT_HISTORY_DAYS);
      setHistory(h);
    };

    fetch();
  }, [plant, id]);

  return { history };
}
