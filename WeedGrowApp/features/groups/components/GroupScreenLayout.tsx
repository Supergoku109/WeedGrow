// GroupScreenLayout.tsx
// This component provides a consistent layout for group-related screens.
// It handles loading state, missing group state, and wraps content in a scrollable safe area.

import React, { memo } from 'react';
import { SafeAreaView, ScrollView, View, StyleSheet } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import { ThemedText } from '@/ui/ThemedText';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

// Props for the GroupScreenLayout component
interface GroupScreenLayoutProps {
  loading: boolean;
  groupExists: boolean;
  children: React.ReactNode;
}

const GroupScreenLayout = memo(function GroupScreenLayout({ loading, groupExists, children }: GroupScreenLayoutProps) {
  const theme = (useColorScheme() ?? 'dark') as keyof typeof Colors;

  // Show loading spinner if loading
  if (loading) {
    return (
      <SafeAreaView style={[styles.flex1, { backgroundColor: Colors[theme].background }]}>
        <View style={styles.center}><ActivityIndicator color={Colors[theme].tint} /></View>
      </SafeAreaView>
    );
  }

  // Show message if group does not exist
  if (!groupExists) {
    return (
      <SafeAreaView style={[styles.flex1, { backgroundColor: Colors[theme].background }]}>
        <View style={styles.center}><ThemedText>Group not found.</ThemedText></View>
      </SafeAreaView>
    );
  }

  // Render children in a scrollable container
  return (
    <SafeAreaView style={[styles.flex1, { backgroundColor: Colors[theme].background }]}>
      <ScrollView contentContainerStyle={styles.container}>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
});

export default GroupScreenLayout;

const styles = StyleSheet.create({
  flex1: { flex: 1 },
  container: { padding: 20, gap: 16 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
