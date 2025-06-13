import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { db } from '@/services/firebase';
import type { PlantLog } from '@/firestoreModels';

/**
 * Fetch all logs for a plant for a specific date (YYYY-MM-DD).
 * Returns logs sorted by timestamp ascending.
 */
export async function fetchPlantLogsForDate(
  plantId: string,
  date: string
): Promise<PlantLog[]> {
  // Build start/end of the day
  const start = new Date(date + 'T00:00:00');
  const end = new Date(date + 'T23:59:59.999');

  const q = query(
    collection(db, 'plants', plantId, 'logs'),
    where('timestamp', '>=', Timestamp.fromDate(start)),
    where('timestamp', '<=', Timestamp.fromDate(end))
  );
  const snap = await getDocs(q);
  // Sort by timestamp ascending
  return snap.docs
    .map((d) => d.data() as PlantLog)
    .sort((a, b) => a.timestamp.toMillis() - b.timestamp.toMillis());
}
