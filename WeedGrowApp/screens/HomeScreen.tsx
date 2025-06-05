import React from 'react';
import { Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import type { RootStackParamList } from '@/navigation/RootNavigator';

export default function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <ThemedView style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <ThemedText type="title">Home</ThemedText>
      <Button title="Add Plant" onPress={() => navigation.navigate('AddPlant')} />
    </ThemedView>
  );
}
