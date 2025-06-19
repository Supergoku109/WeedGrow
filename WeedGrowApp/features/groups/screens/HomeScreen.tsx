import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Snackbar, Searchbar, IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
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
import { useHomeScreenState } from '../hooks/useHomeScreenState';

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
  tabContainer: {
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

export default function HomeScreen({ initialTabIndex = 0 }: { initialTabIndex?: number }) {
  const router = useRouter();
  const theme = (useColorScheme() ?? 'dark') as keyof typeof Colors;

  // State and handlers from the custom hook
  const {
    state,
    searchQuery,
    setSearchQuery,
    filteredGroups,
    groupPlantsMap,
    snackVisible,
    setSnackVisible,
    snackMessage,
    handleEditGroup,
    handleWaterAll,
  } = useHomeScreenState();

  // Tab state
  const [tabIndex, setTabIndex] = useState(initialTabIndex);

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
      <SafeAreaView style={{ flex: 1, backgroundColor: 'transparent' }} edges={['top', 'left', 'right']}>
        {/* Modern App Header */}
        <AppHeader />
        {/* TLC needed indicator */}
        <View style={{ alignItems: 'flex-start', marginBottom: 0, marginLeft: 20, flexDirection: 'row', gap: 0 }}>
          <MaterialCommunityIcons name="heart-pulse" size={15} color="#ff6b81" style={{ marginRight: 1, marginTop: 6 }} />
          <ThemedText style={{ color: '#ff6b81', fontWeight: '600', fontSize: 13 }}>({tlcCount}) TLC Needed</ThemedText>
        </View>
        {/* Suggestion Catalog */}
        <SuggestionCatalog suggestions={mockSuggestions} />
        {/* Simple Tab Implementation */}
        <View style={{ marginTop: 4, marginBottom: 4, flex: 1 }}>
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tabButton, tabIndex === 0 && styles.tabButtonActive]}
              onPress={() => setTabIndex(0)}
            >
              <Text style={[styles.tabText, tabIndex === 0 && styles.tabTextActive]}>Groups</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabButton, tabIndex === 1 && styles.tabButtonActive]}
              onPress={() => setTabIndex(1)}
            >
              <Text style={[styles.tabText, tabIndex === 1 && styles.tabTextActive]}>Plants</Text>
            </TouchableOpacity>
          </View>
          {tabIndex === 0 ? (
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
          ) : (
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
          )}
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
      </SafeAreaView>
    </View>
  );
}
