/**
 * Group API Module
 * Handles all Firestore operations related to plant groups
 */
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
  DocumentReference,
} from 'firebase/firestore';
import { db } from '@/services/firebase';
import type { Group, PlantLog } from '@/firestoreModels';
import { addPlantLog } from '@/lib/logs/addPlantLog';

/**
 * Group type with ID field
 */
export type GroupWithId = Group & { id: string };

/**
 * Options for creating a new group
 */
export interface CreateGroupOptions {
  name: string;
  plantIds: string[];
  environment: 'outdoor' | 'indoor' | 'greenhouse';
  location?: { lat: number; lng: number } | null;
  createdBy: string;
  sensorProfileId?: string;
}

/**
 * Options for updating an existing group
 */
export type UpdateGroupOptions = Partial<Omit<Group, 'createdAt' | 'createdBy'>>;

/**
 * Fetches all groups created by a specific user
 * @param userId - The user ID to fetch groups for
 * @returns Promise containing array of groups with IDs
 */
export async function getUserGroups(userId: string): Promise<GroupWithId[]> {
  try {
    const q = query(collection(db, 'groups'), where('createdBy', '==', userId));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Group) }));
  } catch (error) {
    console.error('Error fetching user groups:', error);
    throw new Error('Failed to load groups. Please try again later.');
  }
}

/**
 * Creates a new plant group
 * @param options - Group creation options
 * @returns Promise with the new group ID
 */
export async function createGroup(options: CreateGroupOptions): Promise<string> {
  try {
    const {
      name,
      plantIds,
      environment,
      location = null,
      createdBy,
      sensorProfileId,
    } = options;    const groupDoc: any = {
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
  } catch (error) {
    console.error('Error creating group:', error);
    throw new Error('Failed to create group. Please try again.');
  }
}

/**
 * Updates an existing group
 * @param groupId - ID of the group to update
 * @param updates - Object with fields to update
 */
export async function updateGroup(groupId: string, updates: UpdateGroupOptions): Promise<void> {
  try {
    const ref = doc(db, 'groups', groupId);
    await updateDoc(ref, { ...updates, updatedAt: serverTimestamp() });
  } catch (error) {
    console.error('Error updating group:', error);
    throw new Error('Failed to update group. Please try again.');
  }
}

/**
 * Deletes a group
 * @param groupId - ID of the group to delete
 */
export async function deleteGroup(groupId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'groups', groupId));
  } catch (error) {
    console.error('Error deleting group:', error);
    throw new Error('Failed to delete group. Please try again.');
  }
}

/**
 * Fetches a single group by ID
 * @param groupId - ID of the group to fetch
 * @returns Promise with the group data or null if not found
 */
export async function getGroupById(groupId: string): Promise<GroupWithId | null> {
  try {
    const docRef = doc(db, 'groups', groupId);
    const snap = await getDoc(docRef);
    
    if (!snap.exists()) return null;
    
    return { id: snap.id, ...(snap.data() as Group) };
  } catch (error) {
    console.error('Error fetching group details:', error);
    throw new Error('Failed to load group details.');
  }
}

/**
 * @deprecated Use waterAllPlantsInGroup instead
 * Legacy method to add water logs to group plants
 */
export async function addWaterLogsToGroupPlants(groupId: string): Promise<void> {
  try {
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
  } catch (error) {
    console.error('Error adding water logs to group plants:', error);
    throw new Error('Failed to water plants. Please try again.');
  }
}

/** 
 * Waters all plants in the group using the provided userId
 * @param groupId - ID of the group containing plants to water
 * @param userId - ID of the user performing the action
 */
export async function waterAllPlantsInGroup(
  groupId: string,
  userId: string,
): Promise<void> {
  try {
    const groupSnapshot = await getDoc(doc(db, 'groups', groupId));
    if (!groupSnapshot.exists()) {
      throw new Error('Group not found');
    }
    
    const group = groupSnapshot.data() as Group;
    
    // Create a watering log entry for each plant in the group
    const wateringPromises = group.plantIds.map((plantId) => 
      addDoc(collection(db, 'plants', plantId, 'logs'), {
        type: 'watering',
        timestamp: serverTimestamp(),
        description: `Group watering: ${group.name}`,
        updatedBy: userId,
      } as PlantLog)
    );
    
    await Promise.all(wateringPromises);
  } catch (error) {
    console.error('Error watering group plants:', error);
    throw new Error('Failed to water plants. Please try again.');
  }
}
