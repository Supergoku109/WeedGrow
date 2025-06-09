import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/services/firebase';
import type { WeatherCacheEntry } from '@/firestoreModels';

/**
 * Returns true if the plant's weatherCache for today is missing or stale.
 * @param plantId Plant document ID
 */
export async function shouldUpdateWeather(plantId: string): Promise<boolean> {
  const today = new Date().toISOString().split('T')[0];
  const ref = doc(db, 'plants', plantId, 'weatherCache', today);
  const snap = await getDoc(ref);
  if (!snap.exists()) return true;
  const data = snap.data() as WeatherCacheEntry;
  // If fetchedAt is not today, consider it stale
  const fetched = data.fetchedAt?.toDate?.() ?? null;
  if (!fetched) return true;
  const fetchedDay = fetched.toISOString().split('T')[0];
  return fetchedDay !== today;
}
