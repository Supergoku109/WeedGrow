import React, { useState } from 'react';
import { Button, TextInput } from 'react-native';
import { useRouter } from 'expo-router';

import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
export default function AddPlantScreen() {
  const router = useRouter();
  const [name, setName] = useState('');

  return (
    <ThemedView style={{ flex: 1, padding: 16 }}>
      <Button title="Back" onPress={() => router.back()} />
      <ThemedText type="title" style={{ marginTop: 16 }}>
        Add Plant
      </ThemedText>
      <TextInput
        placeholder="Plant name"
        value={name}
        onChangeText={setName}
        style={{ borderWidth: 1, marginTop: 16, padding: 8 }}
      />
    </ThemedView>
  );
}
