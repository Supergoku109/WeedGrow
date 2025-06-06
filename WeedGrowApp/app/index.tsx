import React from 'react';
import { FAB } from 'react-native-paper';
import { useRouter } from 'expo-router';

import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
export default function HomeScreen() {
  const router = useRouter();

  return (
    <ThemedView style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <ThemedText type="title">Home</ThemedText>
      <FAB
        icon="plus"
        label="Add Plant"
        onPress={() => router.push('/add-plant')}
        style={{ position: 'absolute', bottom: 16, right: 16, backgroundColor: 'green' }}
      />
    </ThemedView>
  );
}
