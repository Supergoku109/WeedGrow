import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button, List, Dialog, Portal, TextInput, ActivityIndicator } from 'react-native-paper';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { db } from '@/services/firebase';
import { useRouter } from 'expo-router';
import { collection, getDocs, doc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import { deleteField } from 'firebase/firestore';
import HomeBackground from '@/features/groups/components/HomeBackground';

export default function ManageSensorProfilesScreen({ emptyMessage }: { emptyMessage?: string } = {}) {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any | null>(null);
  const [editName, setEditName] = useState('');
  const [editEnv, setEditEnv] = useState<'indoor' | 'greenhouse'>('indoor');
  const [editManual, setEditManual] = useState(true);
  const [editTemp, setEditTemp] = useState('');
  const [editHumidity, setEditHumidity] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [linkedPlants, setLinkedPlants] = useState<any[]>([]);
  const [showLinked, setShowLinked] = useState(false);
  const theme = (useColorScheme() ?? 'dark') as keyof typeof Colors;
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;
    const fetchProfiles = async () => {
      setLoading(true);
      try {
        const snap = await getDocs(collection(db, 'sensorProfiles'));
        if (isMounted) {
          setProfiles(snap.docs.map((d: any) => ({ id: d.id, ...d.data() })));
        }
      } catch (e) {
        if (isMounted) setProfiles([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchProfiles();
    return () => { isMounted = false; };
  }, [editing, deletingId]);

  const handleEdit = (profile: any) => {
    setEditing(profile);
    setEditName(profile.name);
    setEditEnv(profile.environmentType);
    setEditManual(profile.isManual);
    setEditTemp(profile.defaultTemp ? String(profile.defaultTemp) : '');
    setEditHumidity(profile.defaultHumidity ? String(profile.defaultHumidity) : '');
  };

  const handleSaveEdit = async () => {
    if (!editing) return;
    Alert.alert('DEBUG', 'Save button pressed!');
    try {
      const update: any = {
        name: editName.trim(),
        environmentType: editEnv,
        isManual: editManual,
      };
      if (editManual) {
        if (editTemp) update.defaultTemp = Number(editTemp);
        else update.defaultTemp = deleteField();
        if (editHumidity) update.defaultHumidity = Number(editHumidity);
        else update.defaultHumidity = deleteField();
      } else {
        update.defaultTemp = deleteField();
        update.defaultHumidity = deleteField();
      }
      await updateDoc(doc(db, 'sensorProfiles', editing.id), update);
      setEditing(null);
    } catch (e) {
      Alert.alert('Error', 'Failed to update profile.');
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    await deleteDoc(doc(db, 'sensorProfiles', id));
    setDeletingId(null);
  };

  const handleShowLinkedPlants = async (profileId: string) => {
    setShowLinked(true);
    const q = query(collection(db, 'plants'), where('sensorProfileId', '==', profileId));
    const snap = await getDocs(q);
    setLinkedPlants(snap.docs.map((d: any) => d.data()));
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#181f1b' }}>
      <HomeBackground />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.heading}>Manage Sensor Profiles</Text>
        <Text style={styles.topInfo}>
          Create, edit, or delete sensor profiles for your grow spaces.
        </Text>
        {loading && <ActivityIndicator style={{ marginTop: 24 }} animating size="large" color={Colors[theme].tint} />}
        {!loading && profiles.length === 0 && <Text style={styles.empty}>{emptyMessage || 'No sensor profiles found. Add one using the + button.'}</Text>}
        {!loading && profiles.map(profile => (
          <List.Section key={profile.id} style={styles.profileCard}>
            <List.Item
              title={profile.name}
              description={`Env: ${profile.environmentType.charAt(0).toUpperCase() + profile.environmentType.slice(1)}  |  ${profile.isManual ? 'Manual' : 'Hardware'}`}
              left={props => <List.Icon {...props} icon={profile.isManual ? 'pencil' : 'chip'} color={Colors[theme].tint} />}
              style={{ backgroundColor: '#2226', borderRadius: 10 }}
            />
            <View style={styles.row}>
              <Button icon="pencil" onPress={() => handleEdit(profile)} mode="outlined" style={styles.actionBtn}>Edit</Button>
              <Button icon="link" onPress={() => handleShowLinkedPlants(profile.id)} mode="outlined" style={styles.actionBtn}>Linked Plants</Button>
              <Button icon="delete" onPress={() => handleDelete(profile.id)} mode="text" color="red" style={styles.actionBtn} disabled={deletingId === profile.id}>Delete</Button>
            </View>
          </List.Section>
        ))}
        <Portal>
          <Dialog visible={!!editing} onDismiss={() => setEditing(null)}>
            <Dialog.Title>Edit Sensor Profile</Dialog.Title>
            <Dialog.Content>
              <Text style={styles.dialogHint}>Update the details for this sensor profile. All fields are editable.</Text>
              <TextInput
                label="Profile Name"
                value={editName}
                onChangeText={setEditName}
                style={styles.input}
                placeholder="e.g. Main Tent"
                autoFocus
                left={<TextInput.Icon icon="label-outline" />}
                maxLength={32}
                returnKeyType="done"
              />
              <Text style={styles.label}>Environment Type</Text>
              <View style={styles.row}>
                <Button
                  mode={editEnv === 'indoor' ? 'contained' : 'outlined'}
                  onPress={() => setEditEnv('indoor')}
                  icon="home"
                  style={styles.envBtn}
                >
                  Indoor
                </Button>
                <Button
                  mode={editEnv === 'greenhouse' ? 'contained' : 'outlined'}
                  onPress={() => setEditEnv('greenhouse')}
                  icon="leaf"
                  style={styles.envBtn}
                >
                  Greenhouse
                </Button>
              </View>
              <Text style={styles.label}>Data Source</Text>
              <View style={styles.row}>
                <Button
                  mode={editManual ? 'contained' : 'outlined'}
                  onPress={() => setEditManual(true)}
                  icon="pencil"
                  style={styles.envBtn}
                >
                  Manual
                </Button>
                <Button
                  mode={!editManual ? 'contained' : 'outlined'}
                  onPress={() => setEditManual(false)}
                  icon="chip"
                  style={styles.envBtn}
                >
                  Hardware
                </Button>
              </View>
              {editManual && (
                <>
                  <Text style={styles.label}>Default Readings (Optional)</Text>
                  <TextInput
                    label="Default Temperature (°C)"
                    value={editTemp}
                    onChangeText={setEditTemp}
                    keyboardType="numeric"
                    style={styles.input}
                    placeholder="e.g. 24"
                    left={<TextInput.Icon icon="thermometer" />}
                    maxLength={5}
                  />
                  <TextInput
                    label="Default Humidity (%)"
                    value={editHumidity}
                    onChangeText={setEditHumidity}
                    keyboardType="numeric"
                    style={styles.input}
                    placeholder="e.g. 60"
                    left={<TextInput.Icon icon="water-percent" />}
                    maxLength={5}
                  />
                </>
              )}
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setEditing(null)}>Cancel</Button>
              <Button 
                onPress={handleSaveEdit}
                disabled={
                  !editName.trim() ||
                  (
                    editName.trim() === editing?.name &&
                    editEnv === editing?.environmentType &&
                    editManual === editing?.isManual &&
                    (editManual
                      ? editTemp === (editing?.defaultTemp ? String(editing.defaultTemp) : '') &&
                        editHumidity === (editing?.defaultHumidity ? String(editing.defaultHumidity) : '')
                      : true)
                  )
                }
              >
                Save
              </Button>
            </Dialog.Actions>
          </Dialog>
          <Dialog visible={showLinked} onDismiss={() => setShowLinked(false)}>
            <Dialog.Title>Linked Plants</Dialog.Title>
            <Dialog.Content>
              {linkedPlants.length === 0 ? (
                <Text>No plants linked to this profile.</Text>
              ) : (
                linkedPlants.map((p, i) => (
                  <Text key={i}>{p.name}</Text>
                ))
              )}
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setShowLinked(false)}>Close</Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 16,
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  topInfo: {
    color: '#6a9',
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 8,
    marginHorizontal: 8,
  },
  empty: {
    textAlign: 'center',
    color: '#888',
    marginTop: 32,
    fontSize: 16,
  },
  profileCard: {
    marginBottom: 16,
    backgroundColor: '#2226',
    borderRadius: 12,
    padding: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
  },
  actionBtn: {
    flex: 1,
  },
  input: {
    borderRadius: 8,
    padding: 8,
    fontSize: 16,
    marginBottom: 8,
  },
  label: {
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 4,
  },
  dialogHint: {
    color: '#888',
    fontSize: 13,
    marginBottom: 8,
    textAlign: 'center',
  },
  envBtn: {
    flex: 1,
    marginHorizontal: 2,
  },
});
