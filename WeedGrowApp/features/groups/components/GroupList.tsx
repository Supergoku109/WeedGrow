import React, { useCallback } from 'react';
import { FlatList, View, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ActivityIndicator, Snackbar, Searchbar, IconButton, Chip } from 'react-native-paper';
import { ThemedText } from '@/ui/ThemedText';
import GroupCard from './GroupCard';
import type { Group, Plant } from '@/firestoreModels';

interface GroupListProps {
  groups: (Group & { id: string })[];
  groupPlantsMap: Record<string, (Plant & { id: string })[]>;
  loading: boolean;
  error: string | null;
  onWaterAll: (groupId: string) => void;
  onEditGroup: (group: Group & { id: string }) => void;
  onAddGroup: () => void;
  theme: string;
}

export default function GroupList({
  groups,
  groupPlantsMap,
  loading,
  error,
  onWaterAll,
  onEditGroup,
  onAddGroup,
  theme,
}: GroupListProps) {
  // Memoize handlers per group
  const getOnWaterAll = useCallback(
    (groupId: string) => () => onWaterAll(groupId),
    [onWaterAll]
  );
  const getOnEditGroup = useCallback(
    (group: Group & { id: string }) => () => onEditGroup(group),
    [onEditGroup]
  );

  return (
    <FlatList
      data={groups.map(g => g.id)}
      keyExtractor={item => item}
      ListEmptyComponent={
        loading ? (
          <ActivityIndicator style={styles.loading} />
        ) : error ? (
          <ThemedText>❌ {error}</ThemedText>
        ) : (
          <View style={{ alignItems: 'center', marginTop: 32 }}>
            <TouchableOpacity
              accessibilityLabel="Add Group"
              onPress={onAddGroup}
              style={[styles.addGroupButton]}
            >
              <MaterialCommunityIcons name="plus" size={24} />
              <ThemedText style={styles.addGroupText}>Add Group</ThemedText>
            </TouchableOpacity>
          </View>
        )
      }
      renderItem={({ item }) => {
        const group = groups.find(g => g.id === item);
        if (!group) return null;
        const groupPlants = groupPlantsMap[group.id] || [];
        return (
          <GroupCard
            group={group}
            plants={groupPlants}
            onEdit={getOnEditGroup(group)}
          />
        );
      }}
      contentContainerStyle={{
        paddingHorizontal: 16,
        paddingTop: 4,
        gap: 12,
        flexGrow: 1,
      }}
    />
  );
}

const styles = StyleSheet.create({
  loading: { marginTop: 20 },
  addGroupButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    marginTop: 8,
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  addGroupText: {
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
});
