import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Snackbar, Searchbar, IconButton } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import GroupList from '../components/GroupList';
import EditGroupModal from '@/features/groups/components/EditGroupModal';
import { useGroupList } from '@/features/groups/hooks/useGroupList';
import PlantListScreen from '@/features/plants/screens/PlantListScreen';
import SuggestionCatalog from '@/ui/SuggestionCatalog';
import AppHeader from '@/ui/AppHeader';
import FilterChips from '../components/FilterChips';
import { useGroupListFilters } from '../hooks/useGroupListFilters';
import { useGroupPlantsMap } from '../hooks/useGroupPlantsMap';
import { useGroupListHandlers } from '../hooks/useGroupListHandlers';
import { ThemedText } from '@/ui/ThemedText';
import HomeBackground from '../components/HomeBackground';
import SwipeTabs from '@/ui/SwipeTabs';

const styles = StyleSheet.create({
  appHeaderModern: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 32,
    paddingBottom: 0,
    backgroundColor: '#181f1b', // clean, dark, minimal
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    marginBottom: 20,
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
  searchRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, marginTop: 0, paddingHorizontal: 12 },
  searchBar: {
    marginRight: 8,
    height: 55,
    minHeight: 55,
    paddingVertical: 0,
    flex: 1,
    backgroundColor: 'rgba(59, 67, 66, 0.55)',
    borderRadius: 100,
    borderWidth: 0,
    paddingHorizontal: 10,
  },
  filtersContainer: { marginBottom: 12, gap: 8 },
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

  // Search/filter logic
  const {
    searchQuery, setSearchQuery,
    envFilter, setEnvFilter,
    filtersVisible, setFiltersVisible,
    filteredGroups
  } = useGroupListFilters(state.groups);

  // Group-to-plant mapping
  const groupPlantsMap = useGroupPlantsMap(filteredGroups, state.allPlants);

  // Snackbar state
  const [snackVisible, setSnackVisible] = useState(false);
  const [snackMessage, setSnackMessage] = useState('');

  // Per-group water loading/disabled state
  const [waterLoadingMap, setWaterLoadingMap] = useState<Record<string, boolean>>({});
  const [waterDisabledMap, setWaterDisabledMap] = useState<Record<string, boolean>>({});

  // Handlers
  const { handleEditGroup } = useGroupListHandlers(
    state.handleWaterAll,
    state.setEditGroup,
    setSnackMessage,
    setSnackVisible
  );

  // Custom handleWaterAll to manage loading state
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

  // Tab state
  const [tabIndex, setTabIndex] = useState(0);
  const tabKeys = ['groups', 'plants'];

  // Plant tab filter state (local, not shared with group tab)
  const [plantSearchQuery, setPlantSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [plantEnvFilter, setPlantEnvFilter] = useState<string | null>(null);
  const [plantedFilter, setPlantedFilter] = useState<string | null>(null);
  const [trainingFilter, setTrainingFilter] = useState<string | null>(null);
  const [plantFiltersVisible, setPlantFiltersVisible] = useState(false);

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

  // TLC needed indicator
  const tlcCount = mockSuggestions.length;

  return (
    <View style={{ flex: 1, backgroundColor: '#181f1b', position: 'relative' }}>
      <HomeBackground />
      <View style={{ flex: 1, backgroundColor: 'transparent', paddingTop:0 }}>
        {/* Modern App Header */}
        <AppHeader />
        {/* TLC needed indicator */}
        <View style={{ alignItems: 'flex-start', marginBottom: 0, marginLeft: 20, flexDirection: 'row', gap: 0 }}>
          <MaterialCommunityIcons name="heart-pulse" size={15} color="#ff6b81" style={{ marginRight: 1, marginTop: 6 }} />
          <ThemedText style={{ color: '#ff6b81', fontWeight: '600', fontSize: 13 }}>({tlcCount}) TLC Needed</ThemedText>
        </View>
        {/* Suggestion Catalog */}
        <SuggestionCatalog suggestions={mockSuggestions} />
        {/* Swipeable Tabs at the top, compact style */}
        <View style={{ marginTop: 4, marginBottom: 4, flex: 1 }}>
          <SwipeTabs
            index={tabIndex}
            onIndexChange={setTabIndex}
            tabs={[
              {
                key: 'groups',
                title: 'Groups',
                render: () => (
                  <View style={{ flex: 1 }}>
                    <View style={styles.searchRow}>
                      <Searchbar
                        placeholder="Search groups"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        style={styles.searchBar}
                        inputStyle={{ color: '#fff', textAlignVertical: 'center' }}
                      />
                    </View>
                    <GroupList
                      groups={filteredGroups}
                      groupPlantsMap={groupPlantsMap}
                      loading={state.loading}
                      error={state.error}
                      onEditGroup={handleEditGroup}
                      onAddGroup={() => router.push('/add-group')}
                      theme={theme}
                    />
                  </View>
                ),
              },
              {
                key: 'plants',
                title: 'Plants',
                render: () => (
                  <View style={{ flex: 1 }}>
                    <View style={styles.searchRow}>
                      <Searchbar
                        placeholder="Search plants"
                        value={plantSearchQuery}
                        onChangeText={setPlantSearchQuery}
                        style={styles.searchBar}
                        inputStyle={{ color: '#fff', textAlignVertical: 'center' }}
                      />
                      <IconButton icon={plantFiltersVisible ? 'filter-off-outline' : 'filter-variant'} onPress={() => setPlantFiltersVisible((v) => !v)} />
                    </View>
                    {plantFiltersVisible && (
                      <View style={styles.filtersContainer}>
                        <FilterChips label="Environment" options={['outdoor', 'greenhouse', 'indoor']} value={plantEnvFilter} setValue={setPlantEnvFilter} />
                      </View>
                    )}
                    <PlantListScreen
                      searchQuery={plantSearchQuery}
                      statusFilter={statusFilter}
                      envFilter={plantEnvFilter}
                      plantedFilter={plantedFilter}
                      trainingFilter={trainingFilter}
                      setSearchQuery={setPlantSearchQuery}
                      setStatusFilter={setStatusFilter}
                      setEnvFilter={setPlantEnvFilter}
                      setPlantedFilter={setPlantedFilter}
                      setTrainingFilter={setTrainingFilter}
                      filtersVisible={plantFiltersVisible}
                      setFiltersVisible={setPlantFiltersVisible}
                    />
                  </View>
                ),
              },
            ]}
          />
        </View>
        <Snackbar visible={snackVisible} onDismiss={() => setSnackVisible(false)} duration={3000}>
          {snackMessage}
        </Snackbar>
        <EditGroupModal
          visible={!!state.editGroup}
          group={state.editGroup as any}
          allPlants={state.allPlants}
          onClose={() => state.setEditGroup(null)}
          onSave={state.reloadGroups}
        />
      </View>
    </View>
  );
}
