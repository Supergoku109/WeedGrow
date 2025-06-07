import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/services/firebase';
import type { PlantAdviceContext } from './getPlantAdvice';
import type { WeatherCacheEntry } from '@/firestoreModels';

/**
 * Fetch weather data from Firestore for yesterday, today and tomorrow
 * and convert it into a PlantAdviceContext.
 */
export async function fetchPlantWeatherContext(
  plantId: string
): Promise<PlantAdviceContext> {
  const dates: string[] = [];
  for (let offset = -1; offset <= 1; offset++) {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    dates.push(d.toISOString().split('T')[0]);
  }

  const docs = await Promise.all(
    dates.map(async (date) => {
      const ref = doc(db, 'plants', plantId, 'weatherCache', date);
      const snap = await getDoc(ref);
      return snap.exists() ? (snap.data() as WeatherCacheEntry) : null;
    })
  );

  const [yesterday, today, tomorrow] = docs;

  return {
    rainToday: Boolean(today && today.rainfall > 0),
    rainTomorrow: Boolean(tomorrow && tomorrow.rainfall > 0),
    rainYesterday: yesterday?.rainfall ?? 0,
    humidity: today?.humidity ?? 50,
    dewPoint: today?.dewPoint ?? 10,
    cloudCoverage: today?.cloudCoverage ?? 40,
    windGust: today?.windGust ?? 10,
    pop: today?.pop ?? 0.2,
  };
}
