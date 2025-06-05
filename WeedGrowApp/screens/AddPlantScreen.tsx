import React, { useState } from 'react';
import { Button, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import type { RootStackParamList } from '@/navigation/RootNavigator';

export default function AddPlantScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [name, setName] = useState('');

  return (
    <ThemedView style={{ flex: 1, padding: 16 }}>
      <Button title="Back" onPress={() => navigation.goBack()} />
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
