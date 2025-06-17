import { useMemo } from 'react';
import type { Group, Plant } from '@/firestoreModels';

export function useGroupPlantsMap(groups: (Group & { id: string })[], allPlants: (Plant & { id: string })[]) {
  return useMemo(() => {
    const map: Record<string, (Plant & { id: string })[]> = {};
    groups.forEach(g => {
      map[g.id] = allPlants.filter(p => g.plantIds?.includes(p.id));
    });
    return map;
  }, [groups, allPlants]);
}
