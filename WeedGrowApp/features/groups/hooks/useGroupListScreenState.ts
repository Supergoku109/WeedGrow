import { useState } from 'react';
import { useGroupList } from './useGroupList';
import { useGroupListFilters } from './useGroupListFilters';
import { useGroupPlantsMap } from './useGroupPlantsMap';
import { useGroupListHandlers } from './useGroupListHandlers';

export const useHomeScreenState = () => {
  const state = useGroupList();

  const {
    searchQuery,
    setSearchQuery,
    envFilter,
    setEnvFilter,
    filtersVisible,
    setFiltersVisible,
    filteredGroups,
  } = useGroupListFilters(state.groups);

  const groupPlantsMap = useGroupPlantsMap(filteredGroups, state.allPlants);

  const [snackVisible, setSnackVisible] = useState(false);
  const [snackMessage, setSnackMessage] = useState('');

  const [waterLoadingMap, setWaterLoadingMap] = useState<Record<string, boolean>>({});
  const [waterDisabledMap, setWaterDisabledMap] = useState<Record<string, boolean>>({});

  const { handleEditGroup } = useGroupListHandlers(
    state.handleWaterAll,
    state.setEditGroup,
    setSnackMessage,
    setSnackVisible
  );

  const handleWaterAll = async (groupId: string) => {
    setWaterLoadingMap((prev) => ({ ...prev, [groupId]: true }));
    setWaterDisabledMap((prev) => ({ ...prev, [groupId]: true }));
    try {
      await state.handleWaterAll(groupId);
      setSnackMessage('All plants watered!');
      setSnackVisible(true);
    } catch (e: any) {
      setSnackMessage(e?.message || 'Failed to water all');
      setSnackVisible(true);
    } finally {
      setWaterLoadingMap((prev) => ({ ...prev, [groupId]: false }));
      setWaterDisabledMap((prev) => ({ ...prev, [groupId]: false }));
    }
  };

  return {
    state,
    searchQuery,
    setSearchQuery,
    envFilter,
    setEnvFilter,
    filtersVisible,
    setFiltersVisible,
    filteredGroups,
    groupPlantsMap,
    snackVisible,
    setSnackVisible,
    snackMessage,
    setSnackMessage,
    waterLoadingMap,
    setWaterLoadingMap,
    waterDisabledMap,
    setWaterDisabledMap,
    handleEditGroup,
    handleWaterAll,
  };
};
