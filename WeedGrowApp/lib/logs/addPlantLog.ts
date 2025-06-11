import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/services/firebase';
import type { PlantLog } from '@/firestoreModels';

export async function addPlantLog(
  plantId: string,
  log: Omit<PlantLog, 'timestamp'>,
  date?: string, // YYYY-MM-DD for retroactive logging
): Promise<void> {
  let logDate: Date;
  if (date) {
    logDate = new Date(date + 'T12:00:00'); // noon for stability
  } else {
    logDate = new Date();
  }
  if (log.type === 'watering') {
    const start = new Date(logDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(logDate);
    end.setHours(23, 59, 59, 999);

    const q = query(
      collection(db, 'plants', plantId, 'logs'),
      where('type', '==', 'watering'),
      where('timestamp', '>=', Timestamp.fromDate(start)),
      where('timestamp', '<=', Timestamp.fromDate(end)),
    );

    const snap = await getDocs(q);
    if (!snap.empty) {
      throw new Error('Watering already logged for this day');
    }
  }

  await addDoc(collection(db, 'plants', plantId, 'logs'), {
    ...log,
    timestamp: date ? Timestamp.fromDate(logDate) : serverTimestamp(),
  });
}
