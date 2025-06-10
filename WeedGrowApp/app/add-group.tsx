import React, { useEffect, useState } from 'react';
import { ScrollView, View, Alert, Dimensions, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TextInput, Button, ActivityIndicator, Menu } from 'react-native-paper';
import * as Location from 'expo-location';
import { collection, getDocs, query } from 'firebase/firestore';
import { useRouter } from 'expo-router';

import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { db } from '@/services/firebase';
import { Plant } from '@/firestoreModels';
import { ThemedText } from '@/ui/ThemedText';
import { createGroup } from '@/features/groups/api/groupApi';
import { arrayIntersection } from '@/lib/arrayIntersection';

interface PlantItem extends Plant {
  id: string;
}

export default function AddGroupScreen() {
  const router = useRouter();
  const [plants, setPlants] = useState<PlantItem[]>([]);
  const [loadingPlants, setLoadingPlants] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [selectedPlantIds, setSelectedPlantIds] = useState<string[]>([]);
  const [groupLocationPlantId, setGroupLocationPlantId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [sensorProfiles, setSensorProfiles] = useState<any[]>([]);
  const [sensorMenu, setSensorMenu] = useState(false);
  const [loadingProfiles, setLoadingProfiles] = useState(false);
  const [groupSensorProfileId, setGroupSensorProfileId] = useState<string | null>(null);
  const [availableGroupProfiles, setAvailableGroupProfiles] = useState<any[]>([]);
  const screen = Dimensions.get('window');
  type Theme = keyof typeof Colors;
  const theme = (useColorScheme() ?? 'dark') as Theme;

  useEffect(() => {
    const fetchPlants = async () => {
      try {
        const q = query(collection(db, 'plants'));
        const snap = await getDocs(q);
        const items: PlantItem[] = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Plant),
        }));
        setPlants(items);
      } catch (e: any) {
        console.error('Error fetching plants', e);
        setError(e.message || 'Failed to load plants');
      } finally {
        setLoadingPlants(false);
      }
    };
    fetchPlants();
  }, []);

  const selectedPlants = plants.filter(p => selectedPlantIds.includes(p.id));
  const selectableLocationPlants = selectedPlants.filter(p => p.location);

  // Fetch all sensor profiles if needed
  useEffect(() => {
    if (selectedPlantIds.length > 0 && selectedPlants.every(p => p.environment === 'indoor' || p.environment === 'greenhouse')) {
      setLoadingProfiles(true);
      getDocs(collection(db, 'sensorProfiles')).then(snap => {
        const allProfiles = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setSensorProfiles(allProfiles);
        // Find intersection of sensorProfileIds
        const allIds = selectedPlants.map(p => p.sensorProfileId).filter(Boolean);
        const sharedIds = arrayIntersection(selectedPlants.map(p => p.sensorProfileId ? [p.sensorProfileId] : []));
        const sharedProfiles = allProfiles.filter(p => sharedIds.includes(p.id));
        setAvailableGroupProfiles(sharedProfiles);
        // If only one, select it by default
        if (sharedProfiles.length === 1) setGroupSensorProfileId(sharedProfiles[0].id);
        else setGroupSensorProfileId(null);
        setLoadingProfiles(false);
      }).catch(() => setLoadingProfiles(false));
    } else {
      setSensorProfiles([]);
      setAvailableGroupProfiles([]);
      setGroupSensorProfileId(null);
    }
  }, [selectedPlantIds.join(','), selectedPlants.map(p => p.sensorProfileId).join(',')]);

  const handleTogglePlant = (id: string) => {
    setSelectedPlantIds((prev) =>
      prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]
    );
    // If deselecting the plant that is currently chosen as group location, clear groupLocationPlantId
    setGroupLocationPlantId((curr) => (curr === id ? null : curr));
  };

  const create = async () => {
    if (saving) return;
    setSaving(true);
    if (!name.trim() || selectedPlantIds.length === 0 || (
      selectedPlants.length > 0 && selectedPlants.every(p => p.environment === 'indoor' || p.environment === 'greenhouse')
        ? !groupSensorProfileId
        : !groupLocationPlantId
    )) {
      setSaving(false);
      return;
    }
    let groupData: any = {
      name: name.trim(),
      plantIds: selectedPlantIds,
      createdBy: 'demoUser',
    };
    if (selectedPlants.length > 0 && selectedPlants.every(p => p.environment === 'indoor' || p.environment === 'greenhouse')) {
      groupData.environment = selectedPlants[0].environment;
      groupData.sensorProfileId = groupSensorProfileId;
      groupData.location = null;
    } else {
      const groupLocationPlant = plants.find(p => p.id === groupLocationPlantId);
      if (!groupLocationPlant || !groupLocationPlant.location) {
        setSaving(false);
        return;
      }
      groupData.environment = groupLocationPlant.environment;
      groupData.location = groupLocationPlant.location;
    }
    try {
      await createGroup(groupData);
      router.back();
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to create group');
    } finally {
      setSaving(false);
    }
  };

  const getEnvLabel = (env: string) => {
    if (env === 'outdoor') return 'Outdoor';
    if (env === 'indoor') return 'Indoor';
    if (env === 'greenhouse') return 'Greenhouse';
    return env;
  };

  const selectedEnv = selectedPlantIds.length > 0
    ? plants.find(p => p.id === selectedPlantIds[0])?.environment
    : null;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: Colors[theme].background }]}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.contentContainer}>
        <ThemedText type="title" style={styles.title}>
          Create Group
        </ThemedText>

        {loadingPlants && (
          <ActivityIndicator style={styles.loading} color={Colors[theme].tint} />
        )}
        {error && <ThemedText>❌ {error}</ThemedText>}

        <TextInput
          label="Group Name"
          value={name}
          onChangeText={setName}
          style={styles.input}
        />

        <ThemedText style={[styles.sectionLabel, { fontWeight: 'bold', fontSize: 17, paddingTop: 24 }]}>🌱 Select Plants to Group</ThemedText>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
          {plants.map(p => {
            const isSelected = selectedPlantIds.includes(p.id);
            const isDisabled = Boolean(selectedEnv && p.environment !== selectedEnv && !isSelected);
            return (
              <TouchableOpacity
                key={p.id}
                style={[
                  {
                    width: 140,
                    marginBottom: 12,
                    opacity: isDisabled ? 0.4 : 1,
                    borderWidth: isSelected ? 2 : 1,
                    borderColor: isSelected ? Colors[theme].tint : '#ccc',
                    borderRadius: 12,
                    backgroundColor: Colors[theme].background,
                    padding: 8,
                    alignItems: 'center',
                  },
                ]}
                disabled={isDisabled}
                onPress={() => {
                  if (isDisabled) return;
                  setSelectedPlantIds(prev =>
                    isSelected ? prev.filter(pid => pid !== p.id) : [...prev, p.id]
                  );
                  setGroupLocationPlantId(curr => (curr === p.id ? null : curr));
                }}
              >
                <Image
                  source={p.imageUri ? { uri: p.imageUri } : require('@/assets/images/partial-react-logo.png')}
                  style={{ width: 80, height: 80, borderRadius: 8, marginBottom: 8, backgroundColor: '#eee' }}
                  resizeMode="cover"
                />
                <ThemedText style={{ fontWeight: 'bold', marginBottom: 2 }}>{p.name}</ThemedText>
                <ThemedText style={{ fontSize: 12, color: '#888' }}>{getEnvLabel(p.environment)}</ThemedText>
              </TouchableOpacity>
            );
          })}
        </View>

        {selectedPlantIds.length > 0 && selectedPlants.some(p => p.environment === 'outdoor') && (
          <>
            <ThemedText style={[styles.sectionLabel, { fontWeight: 'bold', fontSize: 17, paddingTop: 24 }]}>📍 Choose Location for Weather</ThemedText>
            {selectableLocationPlants.length === 0 ? (
              <ThemedText>No selected plant has a location.</ThemedText>
            ) : (
              selectableLocationPlants.map(p => {
                const nickname = p.locationNickname && p.locationNickname.trim() ? p.locationNickname : 'Unnamed location';
                return (
                  <TouchableOpacity
                    key={p.id}
                    style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4, opacity: groupLocationPlantId === p.id ? 1 : 0.6 }}
                    onPress={() => setGroupLocationPlantId(p.id)}
                  >
                    <View style={{
                      width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: groupLocationPlantId === p.id ? Colors[theme].tint : '#ccc', marginRight: 8, alignItems: 'center', justifyContent: 'center',
                    }}>
                      {groupLocationPlantId === p.id && <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: Colors[theme].tint }} />}
                    </View>
                    <ThemedText>{`${p.name} (${nickname})`}</ThemedText>
                  </TouchableOpacity>
                );
              })
            )}
          </>
        )}

        {selectedPlantIds.length > 0 && selectedPlants.every(p => p.environment === 'indoor' || p.environment === 'greenhouse') && (
          <>
            <ThemedText style={[styles.sectionLabel, { fontWeight: 'bold', fontSize: 17, paddingTop: 24 }]}>🌡️ Select Sensor Profile for Group</ThemedText>
            <Menu
              visible={sensorMenu}
              onDismiss={() => setSensorMenu(false)}
              anchor={
                <TextInput
                  label={loadingProfiles ? 'Loading Sensor Profiles...' : 'Sensor Profile'}
                  value={availableGroupProfiles.find(p => p.id === groupSensorProfileId)?.name || ''}
                  style={styles.input}
                  editable={false}
                  right={<TextInput.Icon icon="menu-down" onPress={() => setSensorMenu(true)} />}
                  placeholder={availableGroupProfiles.length === 0 ? 'No shared profiles' : 'Select a profile'}
                />
              }
            >
              {availableGroupProfiles.map((profile) => (
                <Menu.Item
                  key={profile.id}
                  onPress={() => {
                    setGroupSensorProfileId(profile.id);
                    setSensorMenu(false);
                  }}
                  title={profile.name}
                />
              ))}
              <Menu.Item
                key="add-new"
                onPress={() => {
                  setSensorMenu(false);
                  router.push('/add-sensor-profile');
                }}
                title="+ Create New Profile"
              />
            </Menu>
            {availableGroupProfiles.length === 0 && (
              <ThemedText style={{ color: '#888', marginTop: 8 }}>No shared sensor profiles among selected plants. Create one to continue.</ThemedText>
            )}
          </>
        )}

        <View style={styles.actionRow}>
          <Button mode="outlined" onPress={() => router.back()}>
            Cancel
          </Button>
          <Button
            mode="contained"
            onPress={create}
            disabled={
              saving ||
              !name.trim() ||
              selectedPlantIds.length === 0 ||
              (
                // If all selected are indoor/greenhouse, require sensor profile
                selectedPlants.length > 0 &&
                selectedPlants.every(p => p.environment === 'indoor' || p.environment === 'greenhouse')
                  ? !groupSensorProfileId
                  : (selectableLocationPlants.length === 0 || !groupLocationPlantId)
              )
            }
            loading={saving}
          >
            Create
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingTop: 8,
  },
  scroll: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 16,
  },
  title: {
    textAlign: 'center',
  },
  loading: {
    marginTop: 8,
  },
  input: {
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  sectionLabel: {
    marginBottom: 8,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
});

