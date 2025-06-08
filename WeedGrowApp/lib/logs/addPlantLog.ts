import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/services/firebase';
import type { PlantLog } from '@/firestoreModels';

export async function addPlantLog(plantId: string, log: Omit<PlantLog, 'timestamp'>): Promise<void> {
  await addDoc(collection(db, 'plants', plantId, 'logs'), {
    ...log,
    timestamp: serverTimestamp(),
  });
}
