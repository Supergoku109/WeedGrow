/**
 * Hook for filtering the groups list based on search and environment 
 */
import { useState, useMemo } from 'react';
import { GroupWithId } from '../api/groupApi';

export type EnvironmentFilter = 'indoor' | 'outdoor' | 'greenhouse' | null;

/**
 * Provides filtering functionality for the groups list
 * @param groups - Array of groups to filter
 * @returns Object containing filter state and filtered groups
 */
export function useGroupListFilters(groups: GroupWithId[]) {
  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [envFilter, setEnvFilter] = useState<EnvironmentFilter>(null);
  const [filtersVisible, setFiltersVisible] = useState(false);

  /**
   * Memoized filtered groups based on search query and environment filter
   */
  const filteredGroups = useMemo(() => {
    const normalizedQuery = searchQuery.toLowerCase().trim();
    
    return groups.filter((group) => {
      // Filter by name (case-insensitive)
      const matchesSearch = normalizedQuery === '' || 
        group.name.toLowerCase().includes(normalizedQuery);
        
      // Filter by environment if environment filter is selected
      const matchesEnvironment = !envFilter || group.environment === envFilter;
      
      return matchesSearch && matchesEnvironment;
    });
  }, [groups, searchQuery, envFilter]);

  /**
   * Clears all active filters
   */
  const clearFilters = () => {
    setSearchQuery('');
    setEnvFilter(null);
  };

  return {
    // Filter state
    searchQuery,
    setSearchQuery,
    envFilter,
    setEnvFilter,
    filtersVisible,
    setFiltersVisible,
    
    // Filtered data
    filteredGroups,
    
    // Actions
    clearFilters,
    
    // Filter metadata
    hasActiveFilters: searchQuery !== '' || envFilter !== null,
  };
}
