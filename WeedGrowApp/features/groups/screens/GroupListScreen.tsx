import React, { useState } from 'react';
import { FlatList, View, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Snackbar, ActivityIndicator, Searchbar, IconButton, Chip } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { ThemedText } from '@/ui/ThemedText';
import GroupCard from '@/features/groups/components/GroupCard';
import EditGroupModal from '@/features/groups/components/EditGroupModal';
import { useGroupList } from '@/features/groups/hooks/useGroupList';
import PlantListScreen from '@/features/plants/screens/PlantListScreen';
import SuggestionCatalog from '@/ui/SuggestionCatalog';
import AppHeader from '@/ui/AppHeader';
import SwipeTabs from '@/ui/SwipeTabs';

const FilterChips = ({ label, options, value, setValue }: any) => (
  <>
    <ThemedText style={styles.filterLabel}>{label}</ThemedText>
    <View style={styles.chipRow}>
      <Chip selected={!value} onPress={() => setValue(null)}>All</Chip>
      {options.map((opt: string) => (
        <Chip key={opt} selected={value === opt} onPress={() => setValue(opt)}>{opt}</Chip>
      ))}
    </View>
  </>
);

const styles = StyleSheet.create({
  appHeaderModern: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 32,
    paddingBottom: 24,
    backgroundColor: '#181f1b', // clean, dark, minimal
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    marginBottom: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#26332b',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 12,
  },
  appNameModern: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 2,
    textShadowColor: 'rgba(0,0,0,0.10)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
    opacity: 0.95,
  },
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
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  searchRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, marginTop: 10 },
  searchBar: { marginRight: 8 },
  filtersContainer: { marginBottom: 12, gap: 8 },
  filterLabel: { marginBottom: 4 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  tabHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  tabButtonActive: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.light.tint,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  tabTextActive: {
    color: Colors.light.tint,
  },
});

export default function GroupListScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const theme = (useColorScheme() ?? 'dark') as keyof typeof Colors;
  const state = useGroupList();
  const [tab, setTab] = useState<'groups' | 'plants'>('groups');
  const [searchQuery, setSearchQuery] = useState('');
  // Plant filters
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [envFilter, setEnvFilter] = useState<string | null>(null);
  const [plantedFilter, setPlantedFilter] = useState<string | null>(null);
  const [trainingFilter, setTrainingFilter] = useState<string | null>(null);

  // Mock suggestions data
  const mockSuggestions = [
    {
      key: 'watering',
      icon: '💧',
      title: 'Plants that need watering today',
      description: 'Based on your weather, logs, and schedule.',
      affected: ['Blue Dream', 'OG Kush', 'Greenhouse Group'],
      onExpand: () => {},
    },
    {
      key: 'mildew',
      icon: '🧫',
      title: 'Powdery mildew risk detected',
      description: 'High humidity and temp swings detected.',
      affected: ['Sour Diesel'],
    },
    {
      key: 'fertilizer',
      icon: '🧪',
      title: 'Fertilizer due soon',
      description: 'Based on your fertilizer schedule.',
      affected: ['Blue Dream', 'OG Kush', 'Sour Diesel', 'Northern Lights'],
      onExpand: () => {},
    },
    {
      key: 'weather',
      icon: '🌩',
      title: 'Storm incoming tomorrow',
      description: 'Severe weather forecasted for your area.',
      affected: ['Greenhouse Group'],
    },
  ];

  // Filtered groups
  const filteredGroups = state.groups.filter((g) => g.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <View style={{ flex: 1, backgroundColor: Colors[theme].background, paddingTop: insets.top }}>
      {/* Modern App Header */}
      <AppHeader />
      {/* Suggestion Catalog */}
      <SuggestionCatalog suggestions={mockSuggestions} />
      {/* Search & Filter UI */}
      <View style={styles.searchRow}>
        <Searchbar
          placeholder={tab === 'groups' ? 'Search groups' : 'Search plants'}
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={[styles.searchBar, { flex: 1 }]}
        />
        {tab === 'plants' && (
          <IconButton icon={filtersVisible ? 'filter-off-outline' : 'filter-variant'} onPress={() => setFiltersVisible((v) => !v)} />
        )}
      </View>
      {tab === 'plants' && filtersVisible && (
        <View style={styles.filtersContainer}>
          <FilterChips label="Status" options={['active', 'archived', 'harvested', 'dead']} value={statusFilter} setValue={setStatusFilter} />
          <FilterChips label="Environment" options={['outdoor', 'greenhouse', 'indoor']} value={envFilter} setValue={setEnvFilter} />
          <FilterChips label="Planted In" options={['pot', 'ground']} value={plantedFilter} setValue={setPlantedFilter} />
          <FilterChips label="Training" options={['LST', 'Topping', 'SCROG']} value={trainingFilter} setValue={setTrainingFilter} />
        </View>
      )}
      <SwipeTabs
        initialKey={tab}
        tabs={[
          {
            key: 'groups',
            title: 'Groups',
            render: () => (
              <FlatList
                data={filteredGroups}
                keyExtractor={(item) => item.id}
                ListEmptyComponent={
                  state.loading ? (
                    <ActivityIndicator style={styles.loading} color={Colors[theme].tint} />
                  ) : state.error ? (
                    <ThemedText>❌ {state.error}</ThemedText>
                  ) : (
                    <View style={{ alignItems: 'center', marginTop: 32 }}>
                      <TouchableOpacity
                        accessibilityLabel="Add Group"
                        onPress={() => router.push('/add-group')}
                        style={[styles.addGroupButton, { backgroundColor: Colors[theme].tint }]}
                      >
                        <MaterialCommunityIcons name="plus" size={24} color={Colors[theme].white} />
                        <ThemedText style={styles.addGroupText}>Add Group</ThemedText>
                      </TouchableOpacity>
                    </View>
                  )
                }
                renderItem={({ item, index }: { item: any; index: number }) => (
                  <>
                    <GroupCard
                      group={item}
                      onWaterAll={() => state.handleWaterAll(item.id)}
                      waterDisabled={state.wateringId === item.id}
                      onEdit={() => state.setEditGroup(item)}
                    />
                    {index === filteredGroups.length - 1 && (
                      <View style={{ alignItems: 'center', marginTop: 16 }}>
                        <TouchableOpacity
                          accessibilityLabel="Add Group"
                          onPress={() => router.push('/add-group')}
                          style={[styles.addGroupButton, { backgroundColor: Colors[theme].tint }]}
                        >
                          <MaterialCommunityIcons name="plus" size={24} color={Colors[theme].white} />
                          <ThemedText style={styles.addGroupText}>Add Group</ThemedText>
                        </TouchableOpacity>
                      </View>
                    )}
                  </>
                )}
                contentContainerStyle={{
                  paddingHorizontal: 16,
                  paddingTop: 4,
                  gap: 12,
                  flexGrow: 1,
                }}
              />
            ),
          },
          {
            key: 'plants',
            title: 'Plants',
            render: () => (
              <PlantListScreen
                searchQuery={searchQuery}
                statusFilter={statusFilter}
                envFilter={envFilter}
                plantedFilter={plantedFilter}
                trainingFilter={trainingFilter}
                setSearchQuery={setSearchQuery}
                setStatusFilter={setStatusFilter}
                setEnvFilter={setEnvFilter}
                setPlantedFilter={setPlantedFilter}
                setTrainingFilter={setTrainingFilter}
                filtersVisible={filtersVisible}
                setFiltersVisible={setFiltersVisible}
              />
            ),
          },
        ]}
      />
      <Snackbar visible={state.snackVisible} onDismiss={() => state.setSnackVisible(false)} duration={3000}>
        {state.snackMessage}
      </Snackbar>
      <EditGroupModal
        visible={!!state.editGroup}
        group={state.editGroup as any}
        allPlants={state.allPlants}
        onClose={() => state.setEditGroup(null)}
        onSave={state.reloadGroups}
      />
    </View>
  );
}
