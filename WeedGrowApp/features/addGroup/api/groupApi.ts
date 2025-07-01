import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/services/firebase';

export async function createGroup({ name, plantIds }: { name: string; plantIds: string[] }) {
  // You can expand this to include location, sensorProfileId, etc.
  return addDoc(collection(db, 'groups'), {
    name,
    plantIds,
    createdAt: new Date(),
  });
}
