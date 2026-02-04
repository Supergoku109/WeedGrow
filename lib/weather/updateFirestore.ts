import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/services/firebase';
import type { WeatherCacheEntry } from '@/firestoreModels';

/**
 * Persist parsed weather data for a plant.
 * Each key of `parsedData` is a date (YYYY-MM-DD) with a `WeatherCacheEntry`.
 * The document is merged with any existing data so future runs can append.
 */
export async function updateWeatherCache(
  plantId: string,
  parsedData: Record<string, WeatherCacheEntry>
): Promise<void> {
  const updates = Object.entries(parsedData).map(([date, entry]) =>
    setDoc(
      doc(db, 'plants', plantId, 'weatherCache', date),
      entry,
      { merge: true }
    )
  );
  await Promise.all(updates);
}
