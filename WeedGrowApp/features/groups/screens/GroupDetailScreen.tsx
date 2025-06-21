/**
 * Screen component for viewing and managing a specific plant group
 */
import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import EditGroupModal from '@/features/groups/components/EditGroupModal';
import GroupHeader from '@/features/groups/components/GroupHeader';
import GroupPlantList from '@/features/groups/components/GroupPlantList';
import GroupScreenLayout from '@/features/groups/components/GroupScreenLayout';
import { useGroupDetail } from '@/features/groups/hooks/useGroupDetail';
import { deleteGroup } from '../api/groupApi';

/**
 * Group detail screen showing group information and plants
 */
export default function GroupDetailScreen() {
  // Get the group ID from URL params
  const { id } = useLocalSearchParams<{ id: string }>();
  
  // Get group data and state management from hook
  const {
    group,
    plants,
    loading,
    editVisible,
    setEditVisible,
    deleting,
    handleDeleteGroup,
    refreshGroup,
  } = useGroupDetail(id);

  return (
    <GroupScreenLayout loading={loading} groupExists={!!group}>
      {group && (
        <>
          {/* Group header with actions */}
          <GroupHeader
            group={group}
            deleting={deleting}
            onEdit={() => setEditVisible(true)}
            onDelete={handleDeleteGroup}
          />
          
          {/* List of plants in the group */}
          <GroupPlantList 
            plants={plants} 
          />

          {/* Modal for editing group details */}
          <EditGroupModal
            visible={editVisible}
            group={group}
            allPlants={plants}
            onClose={() => setEditVisible(false)}
            onSave={(updatedGroup) => {
              setEditVisible(false);
              refreshGroup();
            }}
            // Force re-render of modal with updated data
            key={editVisible ? group.id : 'hidden'}
          />
        </>
      )}
    </GroupScreenLayout>
  );
}
