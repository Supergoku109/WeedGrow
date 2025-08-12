/**
 * Screen component for viewing and managing a specific plant group
 */
import React, { memo, useCallback } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import EditGroupModal from '@/features/groups/components/EditGroupModal';
import GroupDetailHeader from '@/features/groups/components/GroupDetailHeader';
import GroupPlantList from '@/features/groups/components/GroupPlantList';
import GroupScreenLayout from '@/features/groups/components/GroupScreenLayout';
import { useGroupDetail } from '@/features/groups/hooks/useGroupDetail';
import { useGroupWeather } from '@/features/groups/hooks/useGroupWeather';
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemedText } from '@/ui/ThemedText';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ConfirmDeleteModal from '@/features/groups/components/ConfirmDeleteModal';
import { updateGroup, type GroupWithId } from '@/features/groups/api/groupApi';

/**
 * Group detail screen showing group information and plants
 */
const GroupDetailScreen = memo(function GroupDetailScreen() {
  // Get the group ID from URL params
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
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
    confirmDeleteVisible,
    cancelDeleteGroup,
    confirmDeleteGroup,
  } = useGroupDetail(id);

  // Weather hook (if group has location)
  const { weather } = useGroupWeather(group?.location?.lat, group?.location?.lng);

  const handleEditClose = useCallback(() => setEditVisible(false), [setEditVisible]);
  const handleEditSave = useCallback(async (updated: GroupWithId) => {
    try {
      await updateGroup(updated.id, { name: updated.name, plantIds: updated.plantIds });
      setEditVisible(false);
      refreshGroup();
    } catch (e) {
      console.error('Failed to update group', e);
      Alert.alert('Error', 'Failed to save group changes. Please try again.');
    }
  }, [refreshGroup, setEditVisible]);

  const handleAddPlant = useCallback(() => {
    if (!id) return;
    router.push({ pathname: '/add-group', params: { groupId: String(id) } });
  }, [router, id]);

  // Reserve extra bottom space for the floating action button + device inset
  const listBottomInset = Math.max(72, 56) + insets.bottom; // ensure enough space under last card

  return (
    <GroupScreenLayout loading={loading} groupExists={!!group} scrollable={false}>
      {group && (
        <View style={{ flex: 1 }}>
          {/* List of plants in the group with a sticky, modern header */}
          <GroupPlantList 
            plants={plants}
            header={( 
              <View style={styles.headerWrapper}>
                <GroupDetailHeader
                  name={group.name}
                  environment={group.environment}
                  weather={weather ? {
                    temperature: weather.temperature,
                    rain: weather.rain,
                    humidity: weather.humidity,
                  } : undefined}
                  totalPlants={plants.length}
                  onMoreOptions={(action) => {
                    if (action === 'edit') setEditVisible(true);
                    if (action === 'delete') handleDeleteGroup();
                  }}
                />
              </View>
            )}
            stickyHeader
            showFooterAddButton={false}
            bottomInset={listBottomInset}
            onAddPlant={handleAddPlant}
          />

          {/* Floating Add Plant Button with subtle gradient/glass effect */}
          <View pointerEvents="box-none" style={[styles.fabContainer, { bottom: 24 + insets.bottom }]}>
            <LinearGradient
              colors={["rgba(255,255,255,0.16)", "rgba(255,255,255,0.06)"]}
              style={styles.fab}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <TouchableOpacity style={styles.fabInner} accessibilityLabel="Add Plant" onPress={handleAddPlant}>
                <MaterialCommunityIcons name="plus" size={26} color="#fff" />
                <ThemedText style={styles.fabText}>Add Plant</ThemedText>
              </TouchableOpacity>
            </LinearGradient>
          </View>

          {/* Modals */}
          <EditGroupModal
            visible={editVisible}
            group={group}
            allPlants={plants}
            onClose={handleEditClose}
            onSave={handleEditSave}
          />
          <ConfirmDeleteModal
            visible={confirmDeleteVisible}
            onCancel={cancelDeleteGroup}
            onConfirm={confirmDeleteGroup}
            title="Delete Group"
            subtitle="This will remove the group but keep your plants safe."
          />
        </View>
      )}
    </GroupScreenLayout>
  );
});

export default GroupDetailScreen;

const styles = StyleSheet.create({
  headerWrapper: {
    paddingTop: 4,
    paddingBottom: 6,
    backgroundColor: 'transparent',
  },
  fabContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  fab: {
    borderRadius: 28,
    overflow: 'hidden',
    backdropFilter: 'blur(10px)' as any, // web only, native will ignore
  },
  fabInner: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 28,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.20,
    shadowRadius: 16,
    elevation: 8,
  },
  fabText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
    marginLeft: 6,
    letterSpacing: 0.3,
  },
});
