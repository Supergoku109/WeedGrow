// GroupPlantList.tsx
// This component displays a list of plants belonging to a group.
// Each plant is shown as a row with its image, name, and growth stage, and is clickable to view plant details.

import React, { memo, useCallback } from 'react';
import { View, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { ThemedText } from '@/ui/ThemedText';
import type { Plant } from '@/firestoreModels';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { PlantCard } from '@/features/plants/components/PlantCard';

interface GroupPlantListProps {
  plants: (Plant & { id: string })[];
  onAddPlant?: () => void;
  // Optional header to render above the list using ListHeaderComponent
  header?: React.ReactElement | null;
  // When true and header is provided, make the header sticky
  stickyHeader?: boolean;
  // Control whether to show the footer Add Plant button
  showFooterAddButton?: boolean;
  // Additional bottom inset to avoid overlapping nav/tab bars
  bottomInset?: number;
}

const GroupPlantList = memo(function GroupPlantList({ plants, onAddPlant, header, stickyHeader = false, showFooterAddButton = true, bottomInset = 0 }: GroupPlantListProps) {
  const router = useRouter();
  const navigateToAddPlant = useCallback(() => {
    if (onAddPlant) return onAddPlant();
    router.push('/add-plant');
  }, [router, onAddPlant]);

  if (!plants || plants.length === 0) {
    return (
      <View style={[styles.emptyContainer, { paddingBottom: 24 + bottomInset }]}> 
        {header}
        <ThemedText style={styles.emptyText}>No plants in this group yet.</ThemedText>
        <TouchableOpacity accessibilityLabel="Add Plant" onPress={navigateToAddPlant} style={styles.addPlantButton}>
          <MaterialCommunityIcons name="plus" size={24} color="#fff" style={{ marginRight: 4 }} />
          <ThemedText style={styles.addPlantText}>Add Plant</ThemedText>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <FlatList
      style={{ flex: 1 }}
      data={plants}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <PlantCard plant={item} />
      )}
      ListHeaderComponent={header ?? undefined}
      ListHeaderComponentStyle={header ? { backgroundColor: 'transparent' } : undefined}
      stickyHeaderIndices={header && stickyHeader ? [0] : undefined}
      ListFooterComponent={showFooterAddButton ? (
        <View style={{ alignItems: 'center', marginTop: 16, marginBottom: bottomInset }}>
          <TouchableOpacity accessibilityLabel="Add Plant" onPress={navigateToAddPlant} style={styles.addPlantButton}>
            <MaterialCommunityIcons name="plus" size={24} color="#fff" style={{ marginRight: 4 }} />
            <ThemedText style={styles.addPlantText}>Add Plant</ThemedText>
          </TouchableOpacity>
        </View>
      ) : <View style={{ height: bottomInset }} />}
      contentContainerStyle={[styles.listContent, { paddingBottom: 24 + bottomInset }]}
      removeClippedSubviews
      initialNumToRender={8}
      windowSize={10}
    />
  );
});

export default GroupPlantList;

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 24,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 32,
  },
  emptyText: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'center',
    marginBottom: 12,
  },
  addPlantButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 28,
    marginTop: -20,
    backgroundColor: 'rgba(255, 255, 255, 0.09)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.03)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.13,
    shadowRadius: 12,
    elevation: 6,
  },
  addPlantText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 17,
    marginLeft: 10,
    letterSpacing: 0.5,
  },
});
