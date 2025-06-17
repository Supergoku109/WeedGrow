import { useState, useMemo } from 'react';
import type { Group } from '@/firestoreModels';

export function useGroupListFilters(groups: (Group & { id: string })[]) {
  const [searchQuery, setSearchQuery] = useState('');
  const [envFilter, setEnvFilter] = useState<string | null>(null);
  const [filtersVisible, setFiltersVisible] = useState(false);

  const filteredGroups = useMemo(() =>
    groups.filter((g) =>
      g.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (!envFilter || g.environment === envFilter)
    ),
    [groups, searchQuery, envFilter]
  );

  return {
    searchQuery,
    setSearchQuery,
    envFilter,
    setEnvFilter,
    filtersVisible,
    setFiltersVisible,
    filteredGroups,
  };
}
