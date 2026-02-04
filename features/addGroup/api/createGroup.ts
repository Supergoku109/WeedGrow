import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/services/firebase';
import type { Group } from '@/firestoreModels';

export async function createGroup({
  name,
  plantIds,
  environment = 'indoor', // default, can be changed
  createdBy = 'demoUser', // TODO: replace with real user id
}: {
  name: string;
  plantIds: string[];
  environment?: 'indoor' | 'outdoor' | 'greenhouse';
  createdBy?: string;
}): Promise<string> {
  const docRef = await addDoc(collection(db, 'groups'), {
    name,
    plantIds,
    environment,
    createdBy,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  } as Partial<Group>);
  return docRef.id;
}
