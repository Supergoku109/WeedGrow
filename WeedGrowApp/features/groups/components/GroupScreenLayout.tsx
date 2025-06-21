// GroupScreenLayout.tsx
// This component provides a consistent layout for group-related screens.
// It handles loading state, missing group state, and wraps content in a scrollable safe area.

import React from 'react';
import { SafeAreaView, ScrollView, View, StyleSheet } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import { ThemedText } from '@/ui/ThemedText';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

// Props for the GroupScreenLayout component
interface Props {
  loading: boolean;
  groupExists: boolean;
  children: React.ReactNode;
}

export default function GroupScreenLayout({ loading, groupExists, children }: Props) {
  const theme = (useColorScheme() ?? 'dark') as keyof typeof Colors;

  // Show loading spinner if loading
  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors[theme].background }}>
        <View style={styles.center}><ActivityIndicator color={Colors[theme].tint} /></View>
      </SafeAreaView>
    );
  }

  // Show message if group does not exist
  if (!groupExists) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors[theme].background }}>
        <View style={styles.center}><ThemedText>Group not found.</ThemedText></View>
      </SafeAreaView>
    );
  }

  // Render children in a scrollable container
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors[theme].background }}>
      <ScrollView contentContainerStyle={styles.container}>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, gap: 16 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
