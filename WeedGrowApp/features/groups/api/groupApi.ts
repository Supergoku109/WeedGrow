import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  getDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/services/firebase';
import type { Group } from '@/firestoreModels';
import { addPlantLog } from '@/lib/logs/addPlantLog';

export async function getUserGroups(userId: string): Promise<(Group & { id: string })[]> {
  const q = query(collection(db, 'groups'), where('createdBy', '==', userId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Group) }));
}

interface CreateGroupOptions {
  name: string;
  plantIds: string[];
  environment: 'outdoor' | 'indoor' | 'greenhouse';
  location?: { lat: number; lng: number } | null;
  createdBy: string;
}

export async function createGroup(options: CreateGroupOptions & { sensorProfileId?: string }): Promise<string> {
  const {
    name,
    plantIds,
    environment,
    location = null,
    createdBy,
    sensorProfileId,
  } = options;

  const groupDoc: any = {
    name,
    environment,
    plantIds,
    location,
    createdBy,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  if (sensorProfileId) groupDoc.sensorProfileId = sensorProfileId;

  const ref = await addDoc(collection(db, 'groups'), groupDoc);
  return ref.id;
}

export async function updateGroup(groupId: string, updates: Partial<Omit<Group, 'createdAt' | 'createdBy'>>): Promise<void> {
  const ref = doc(db, 'groups', groupId);
  await updateDoc(ref, { ...updates, updatedAt: serverTimestamp() });
}

export async function deleteGroup(groupId: string): Promise<void> {
  await deleteDoc(doc(db, 'groups', groupId));
}

export async function addWaterLogsToGroupPlants(groupId: string): Promise<void> {
  const snap = await getDoc(doc(db, 'groups', groupId));
  if (!snap.exists()) return;
  const group = snap.data() as Group;
  await Promise.all(
    group.plantIds.map((pid) =>
      addPlantLog(pid, {
        type: 'watering',
        description: `Watered via group ${group.name}`,
        updatedBy: group.createdBy,
      })
    )
  );
}

/** Water all plants in the group using the provided userId. */
export async function waterAllPlantsInGroup(
  groupId: string,
  userId: string,
): Promise<void> {
  const snap = await getDoc(doc(db, 'groups', groupId));
  if (!snap.exists()) return;
  const group = snap.data() as Group;
  await Promise.all(
    group.plantIds.map((pid) =>
      addDoc(collection(db, 'plants', pid, 'logs'), {
        type: 'watering',
        timestamp: serverTimestamp(),
        description: 'Group watering',
        updatedBy: userId,
      }),
    ),
  );
}
