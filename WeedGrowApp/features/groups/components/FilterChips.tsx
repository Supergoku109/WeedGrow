import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Chip } from 'react-native-paper';
import { ThemedText } from '@/ui/ThemedText';

interface FilterChipsProps {
  label: string;
  options: string[];
  value: string | null;
  setValue: (v: string | null) => void;
}

export default function FilterChips({ label, options, value, setValue }: FilterChipsProps) {
  return (
    <>
      <ThemedText style={styles.filterLabel}>{label}</ThemedText>
      <View style={styles.chipRow}>
        <Chip selected={!value} onPress={() => setValue(null)}>All</Chip>
        {options.map((opt) => (
          <Chip key={opt} selected={value === opt} onPress={() => setValue(opt)}>{opt}</Chip>
        ))}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  filterLabel: { marginBottom: 4 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
});
