import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function PlantsScreen() {
  const router = useRouter();
  type Theme = keyof typeof Colors;
  const theme = (useColorScheme() ?? 'dark') as Theme;
  return (
    <ThemedView style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <ThemedText type="title">Plants</ThemedText>
      <TouchableOpacity
        accessibilityLabel="Add Plant"
        onPress={() => router.push('/add-plant')}
        style={[styles.fab, { backgroundColor: Colors[theme].tint }]}
      >
        <MaterialCommunityIcons name="plus" size={28} color={Colors[theme].white} />
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
  },
});
