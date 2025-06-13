import { collection, getDocs, query, where, Timestamp, doc, getDoc } from 'firebase/firestore';
import { db } from '@/services/firebase';
import type { PlantLog, WeatherCacheEntry } from '@/firestoreModels';

/**
 * Fetch logs and weather for a plant for a date range (inclusive).
 * Returns an object keyed by date: { [date]: { logs: PlantLog[], weather: WeatherCacheEntry|null } }
 */
export async function fetchLogsAndWeatherForRange(
  plantId: string,
  startDate: string, // YYYY-MM-DD
  endDate: string    // YYYY-MM-DD
): Promise<Record<string, { logs: PlantLog[]; weather: WeatherCacheEntry | null }>> {
  // Build date array
  const dates: string[] = [];
  let d = new Date(startDate);
  const end = new Date(endDate);
  while (d <= end) {
    dates.push(d.toISOString().split('T')[0]);
    d.setDate(d.getDate() + 1);
  }

  // Fetch logs for range
  const start = new Date(startDate + 'T00:00:00');
  const endDt = new Date(endDate + 'T23:59:59.999');
  const logsQ = query(
    collection(db, 'plants', plantId, 'logs'),
    where('timestamp', '>=', Timestamp.fromDate(start)),
    where('timestamp', '<=', Timestamp.fromDate(endDt))
  );
  const logsSnap = await getDocs(logsQ);
  const logs: PlantLog[] = logsSnap.docs.map(d => d.data() as PlantLog);

  // Group logs by date
  const logsByDate: Record<string, PlantLog[]> = {};
  logs.forEach(log => {
    const date = log.timestamp?.toDate?.().toISOString().split('T')[0];
    if (date) {
      if (!logsByDate[date]) logsByDate[date] = [];
      logsByDate[date].push(log);
    }
  });

  // Fetch weather for each date
  const weatherByDate: Record<string, WeatherCacheEntry | null> = {};
  await Promise.all(dates.map(async (date) => {
    const ref = doc(db, 'plants', plantId, 'weatherCache', date);
    const snap = await getDoc(ref);
    weatherByDate[date] = snap.exists() ? (snap.data() as WeatherCacheEntry) : null;
  }));

  // Combine
  const result: Record<string, { logs: PlantLog[]; weather: WeatherCacheEntry | null }> = {};
  dates.forEach(date => {
    result[date] = {
      logs: logsByDate[date] || [],
      weather: weatherByDate[date] || null,
    };
  });
  return result;
}
