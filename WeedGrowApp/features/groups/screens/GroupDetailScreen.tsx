import React, { useState } from 'react';
import { Alert, BackHandler } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import EditGroupModal from '@/features/groups/components/EditGroupModal';
import GroupHeader from '@/features/groups/components/GroupHeader';
import GroupPlantList from '@/features/groups/components/GroupPlantList';
import GroupScreenLayout from '@/features/groups/components/GroupScreenLayout';
import { useGroupDetail } from '@/features/groups/hooks/useGroupDetail';

export default function GroupDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [editVisible, setEditVisible] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const { group, plants, loading } = useGroupDetail(id);

  const handleDeleteGroup = () => {
    if (!group) return;

    Alert.alert(
      'Delete Group',
      'Are you sure you want to delete this group? This will NOT delete the plants, only the group.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              const { doc, deleteDoc } = await import('firebase/firestore');
              const { db } = await import('@/services/firebase');
              await deleteDoc(doc(db, 'groups', group.id));
              router.replace('/(tabs)');
            } catch (e) {
              Alert.alert('Error', 'Failed to delete group');
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  // Handle back button while editing
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        if (editVisible) {
          setEditVisible(false);
          return true;
        }
        router.replace('/');
        return true;
      };
      const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => sub.remove();
    }, [editVisible, router])
  );

  return (
    <GroupScreenLayout loading={loading} groupExists={!!group}>
      {group && (
        <>
          <GroupHeader
            group={group}
            deleting={deleting}
            onEdit={() => setEditVisible(true)}
            onDelete={handleDeleteGroup}
          />

          <GroupPlantList plants={plants} />

          <EditGroupModal
            visible={editVisible}
            group={group}
            allPlants={plants}
            onClose={() => setEditVisible(false)}
            onSave={() => setEditVisible(false)}
            key={editVisible ? group.id : 'hidden'}
          />
        </>
      )}
    </GroupScreenLayout>
  );
}
