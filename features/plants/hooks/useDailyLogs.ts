import { useState, useEffect } from 'react';
import { PlantLog } from '@/firestoreModels';
import { fetchPlantLogsForDate } from '@/lib/logs/fetchPlantLogsForDate';

export function useDailyLogs(id?: string) {
  const [dailyLogs, setDailyLogs] = useState<Record<string, PlantLog[]>>({});
  const [expandedLogDate, setExpandedLogDate] = useState<string | null>(null);
  const [loadingLogs, setLoadingLogs] = useState(false);

  useEffect(() => {
    if (!id || !expandedLogDate) return;
    let cancelled = false;
    setLoadingLogs(true);

    (async () => {
      const logs = await fetchPlantLogsForDate(String(id), expandedLogDate);
      if (!cancelled) {
        setDailyLogs((prev) => ({ ...prev, [expandedLogDate]: logs }));
        setLoadingLogs(false);
      }
    })();

    return () => { cancelled = true; };
  }, [id, expandedLogDate]);

  return { dailyLogs, expandedLogDate, setExpandedLogDate, loadingLogs };
}
