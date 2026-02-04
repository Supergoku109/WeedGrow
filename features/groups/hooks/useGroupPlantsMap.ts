/**
 * Hook for mapping groups to their respective plants
 */
import { useMemo } from 'react';
import { GroupWithId } from '../api/groupApi';
import { PlantWithId } from './useGroupDetail';

/**
 * Creates a mapping of group IDs to their associated plants
 * @param groups - Array of groups to create mapping for
 * @param allPlants - Array of all plants in the system
 * @returns Record mapping group IDs to arrays of plants
 */
export function useGroupPlantsMap(
  groups: GroupWithId[], 
  allPlants: PlantWithId[]
): Record<string, PlantWithId[]> {
  return useMemo(() => {
    const plantsMap: Record<string, PlantWithId[]> = {};
    
    // Create a map for faster plant lookups
    const plantMap = new Map<string, PlantWithId>();
    allPlants.forEach(plant => plantMap.set(plant.id, plant));
    
    // For each group, find its plants
    groups.forEach(group => {
      // Get plants that belong to this group
      const groupPlants: PlantWithId[] = [];
      
      if (group.plantIds?.length) {
        // Only look up plants that exist
        group.plantIds.forEach(plantId => {
          const plant = plantMap.get(plantId);
          if (plant) {
            groupPlants.push(plant);
          }
        });
      }
      
      plantsMap[group.id] = groupPlants;
    });
    
    return plantsMap;
  }, [groups, allPlants]);
}
