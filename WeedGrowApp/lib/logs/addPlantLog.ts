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
): Promise<void> {
  if (log.type === 'watering') {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const q = query(
      collection(db, 'plants', plantId, 'logs'),
      where('type', '==', 'watering'),
      where('timestamp', '>=', Timestamp.fromDate(start)),
      where('timestamp', '<=', Timestamp.fromDate(end)),
    );

    const snap = await getDocs(q);
    if (!snap.empty) {
      throw new Error('Watering already logged today');
    }
  }

  await addDoc(collection(db, 'plants', plantId, 'logs'), {
    ...log,
    timestamp: serverTimestamp(),
  });
}
