import React from 'react';
import { ScrollView, View } from 'react-native';
import { Button } from 'react-native-paper';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { PlantSelection } from '../components/PlantSelection';
import HomeBackground from '@/features/home/components/HomeBackground';
import { AnimatedMakikoInput } from '@/components/ui/AnimatedMakikoInput';
import { ThemedText } from '@/ui/ThemedText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAddGroup } from '../hooks/useAddGroup';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { getGroupById, updateGroup, type GroupWithId } from '@/features/groups/api/groupApi';

export default function AddGroupScreen() {
  const theme = (useColorScheme() ?? 'dark') as 'light' | 'dark';
  const router = useRouter();
  const { groupId } = useLocalSearchParams<{ groupId?: string }>();

  const {
    plants,
    loading,
    error,
    selectedPlantIds,
    setSelectedPlantIds,
    groupLocationPlantId,
    setGroupLocationPlantId,
    groupName,
    setGroupName,
    submitting,
    handleTogglePlant,
    handleCreateGroup,
  } = useAddGroup();

  // Local state for add-to-group mode
  const [existingGroup, setExistingGroup] = React.useState<GroupWithId | null>(null);
  const [groupLoading, setGroupLoading] = React.useState(false);
  const isAddToGroupMode = Boolean(groupId);

  React.useEffect(() => {
    let active = true;
    const load = async () => {
      if (!groupId) return;
      try {
        setGroupLoading(true);
        const g = await getGroupById(String(groupId));
        if (active) setExistingGroup(g);
      } finally {
        if (active) setGroupLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, [groupId]);

  // Compute available plants in add-to-group mode (same env and not already in group)
  const availablePlants = React.useMemo(() => {
    if (!isAddToGroupMode || !existingGroup) return plants;
    const currentIds = new Set(existingGroup.plantIds || []);
    return plants.filter((p) => p.environment === existingGroup.environment && !currentIds.has(p.id));
  }, [plants, existingGroup, isAddToGroupMode]);

  const onPrimaryAction = React.useCallback(async () => {
    if (isAddToGroupMode) {
      if (!existingGroup || selectedPlantIds.length === 0) {
        router.back();
        return;
      }
      try {
        const nextIds = Array.from(new Set([...(existingGroup.plantIds || []), ...selectedPlantIds]));
        await updateGroup(existingGroup.id, { plantIds: nextIds });
        router.replace({ pathname: '/group/[id]', params: { id: existingGroup.id } });
      } catch {
        // minimal handling
      }
      return;
    }
    // Default create-group action
    handleCreateGroup();
  }, [isAddToGroupMode, existingGroup, selectedPlantIds, router, handleCreateGroup]);

  const primaryLabel = isAddToGroupMode ? 'Add to Group' : 'Next';
  const title = isAddToGroupMode ? 'Add Plants to Group' : 'Create Group';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors[theme].background }}>
      <HomeBackground />
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <ThemedText type="title" style={{ textAlign: 'center', marginBottom: 16 }}>
          {title}
        </ThemedText>
        {/* Show name input only when creating a group */}
        {!isAddToGroupMode && (
          <AnimatedMakikoInput
            label="Group Name"
            iconName="users"
            iconClass={require('react-native-vector-icons/Feather').default}
            value={groupName}
            onChangeText={setGroupName}
          />
        )}

        {(loading || groupLoading) && <Button loading>Loading Plants...</Button>}
        {error && <Button>{error}</Button>}

        {/* Plant selection: filtered in add-to-group mode */}
        <PlantSelection
          plants={availablePlants}
          selectedPlantIds={selectedPlantIds}
          onTogglePlant={handleTogglePlant}
          {...(!isAddToGroupMode
            ? { groupLocationPlantId, onSelectGroupLocationPlantId: setGroupLocationPlantId }
            : {
                allowedEnvironment: existingGroup?.environment,
                disabledIds: existingGroup?.plantIds || [],
              }
          )}
        />

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 }}>
          <Button
            onPress={() => router.back()}
            mode="outlined"
            style={{ flex: 1, marginRight: 8 }}
          >
            Back
          </Button>
          <Button
            onPress={onPrimaryAction}
            mode="contained"
            style={{ flex: 1 }}
            loading={submitting || groupLoading}
            disabled={(submitting || groupLoading) || (!isAddToGroupMode && selectedPlantIds.length === 0 && !groupName.trim())}
          >
            {primaryLabel}
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
