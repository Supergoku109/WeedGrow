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
        ) : null
      }
      ListFooterComponent={
        <View style={{ alignItems: 'center', marginTop: 16, marginBottom: 24 }}>
          <TouchableOpacity
            accessibilityLabel="Add Group"
            onPress={onAddGroup}
            style={[styles.addGroupButton]}
          >
            <MaterialCommunityIcons name="plus" size={24} color="#fff" style={{ marginRight: 4 }} />
            <ThemedText style={styles.addGroupText}>Add Group</ThemedText>
          </TouchableOpacity>
        </View>
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
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 28,
    marginTop: -20,
    marginBottom: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.09)', // Glassy white
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.03)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.13,
    shadowRadius: 12,
    elevation: 6,
  },
  addGroupText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 17,
    marginLeft: 10,
    letterSpacing: 0.5,
  },
});
