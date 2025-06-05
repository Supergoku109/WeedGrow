import React from 'react';
import { Button } from 'react-native';
import { useRouter } from 'expo-router';

import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
export default function HomeScreen() {
  const router = useRouter();

  return (
    <ThemedView style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <ThemedText type="title">Home</ThemedText>
      <Button title="Add Plant" onPress={() => router.push('/add-plant')} />
    </ThemedView>
  );
}
