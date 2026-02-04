import { collection, getDocs, query, Timestamp, where } from 'firebase/firestore';
import { db } from '@/services/firebase';

export const DEFAULT_HISTORY_DAYS = 5;

export interface WateringHistoryEntry {
  date: string; // YYYY-MM-DD
  watered: boolean;
}

/**
 * Fetch watering history for the past `days` days including today.
 * Returns an array ordered from oldest to newest.
 */
export async function fetchWateringHistory(
  plantId: string,
  days = DEFAULT_HISTORY_DAYS,
): Promise<WateringHistoryEntry[]> {
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  const start = new Date(end);
  start.setDate(end.getDate() - (days - 1));
  start.setHours(0, 0, 0, 0);

  const q = query(
    collection(db, 'plants', plantId, 'logs'),
    where('type', '==', 'watering'),
    where('timestamp', '>=', Timestamp.fromDate(start)),
    where('timestamp', '<=', Timestamp.fromDate(end)),
  );

  const snap = await getDocs(q);
  const wateredDates = new Set(
    snap.docs.map((d) => d.data().timestamp.toDate().toISOString().split('T')[0])
  );

  const history: WateringHistoryEntry[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(end);
    d.setDate(end.getDate() - i);
    const iso = d.toISOString().split('T')[0];
    history.push({ date: iso, watered: wateredDates.has(iso) });
  }
  return history;
}
