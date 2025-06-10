import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TextInput, Button, RadioButton, Text, Switch, SegmentedButtons } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { db } from '@/services/firebase';
import { addDoc, collection } from 'firebase/firestore';

export default function AddSensorProfileScreen() {
  const [name, setName] = useState('');
  const [environmentType, setEnvironmentType] = useState<'indoor' | 'greenhouse'>('indoor');
  const [entryType, setEntryType] = useState<'manual' | 'hardware'>('manual');
  const [defaultTemp, setDefaultTemp] = useState('');
  const [defaultHumidity, setDefaultHumidity] = useState('');
  const [saving, setSaving] = useState(false);
  const theme = (useColorScheme() ?? 'dark') as keyof typeof Colors;
  const router = useRouter();

  const handleSave = async () => {
    setSaving(true);
    try {
      const docRef = await addDoc(collection(db, 'sensorProfiles'), {
        name: name.trim(),
        environmentType,
        isManual: entryType === 'manual',
        defaultTemp: entryType === 'manual' && defaultTemp ? Number(defaultTemp) : undefined,
        defaultHumidity: entryType === 'manual' && defaultHumidity ? Number(defaultHumidity) : undefined,
        createdAt: new Date(),
      });
      // Instead of router.back(), go to step2 and pass newSensorProfileId
      router.replace({ pathname: '/add-plant/step2', params: { newSensorProfileId: docRef.id } });
    } catch (e) {
      // handle error
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors[theme].background }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.heading}>Add Sensor Profile</Text>
          <TextInput
            label="Profile Name"
            value={name}
            onChangeText={setName}
            style={styles.input}
            placeholder="e.g. Main Tent"
            autoFocus
          />
          <Text style={styles.label}>Environment Type</Text>
          <SegmentedButtons
            value={environmentType}
            onValueChange={v => setEnvironmentType(v as 'indoor' | 'greenhouse')}
            buttons={[
              { value: 'indoor', label: 'Indoor' },
              { value: 'greenhouse', label: 'Greenhouse' },
            ]}
            style={{ marginBottom: 8 }}
          />
          <Text style={styles.label}>Sensor Data Source</Text>
          <SegmentedButtons
            value={entryType}
            onValueChange={v => setEntryType(v as 'manual' | 'hardware')}
            buttons={[
              { value: 'manual', label: 'Manual Entry', icon: 'pencil' },
              { value: 'hardware', label: 'Hardware (future)', icon: 'chip' },
            ]}
            style={{ marginBottom: 8 }}
          />
          {entryType === 'manual' && (
            <>
              <Text style={styles.label}>Default Readings (Optional)</Text>
              <TextInput
                label="Default Temperature (°C)"
                value={defaultTemp}
                onChangeText={setDefaultTemp}
                keyboardType="numeric"
                style={styles.input}
                placeholder="e.g. 24"
              />
              <TextInput
                label="Default Humidity (%)"
                value={defaultHumidity}
                onChangeText={setDefaultHumidity}
                keyboardType="numeric"
                style={styles.input}
                placeholder="e.g. 60"
              />
            </>
          )}
          {entryType === 'hardware' && (
            <Text style={{ color: Colors[theme].gray, marginBottom: 8 }}>
              Hardware integration coming soon. You can edit this profile later.
            </Text>
          )}
          <Button
            mode="contained"
            onPress={handleSave}
            loading={saving}
            disabled={!name.trim() || saving}
            style={{ marginTop: 24 }}
          >
            Save Profile
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>
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
  input: {
    borderRadius: 8,
    padding: 8,
    fontSize: 16,
  },
  label: {
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 4,
  },
});
