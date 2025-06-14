import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from '@/ui/ThemedText';

interface NotesSectionProps {
  notes?: string;
}

export default function NotesSection({ notes }: NotesSectionProps) {
  if (!notes) return null;

  return (
    <View style={styles.section}>
      <ThemedText type="subtitle">Notes</ThemedText>
      <ThemedText>{notes}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginVertical: 10 },
});
