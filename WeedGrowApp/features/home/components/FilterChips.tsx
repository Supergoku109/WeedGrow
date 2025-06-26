import React, { memo, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { Chip } from 'react-native-paper';
import { ThemedText } from '@/ui/ThemedText';

interface FilterChipsProps {
  label: string;
  options: string[];
  value: string | null;
  setValue: (v: string | null) => void;
}

const FilterChips = memo(function FilterChips({ label, options, value, setValue }: FilterChipsProps) {
  const handleSelect = useCallback((opt: string | null) => setValue(opt), [setValue]);
  return (
    <>
      <ThemedText style={styles.filterLabel}>{label}</ThemedText>
      <View style={styles.chipRow}>
        <Chip selected={!value} onPress={() => handleSelect(null)} accessibilityState={{ selected: !value }}>All</Chip>
        {options.map((opt) => (
          <Chip
            key={opt}
            selected={value === opt}
            onPress={() => handleSelect(opt)}
            accessibilityState={{ selected: value === opt }}
          >
            {opt}
          </Chip>
        ))}
      </View>
    </>
  );
});

export default FilterChips;

const styles = StyleSheet.create({
  filterLabel: { marginBottom: 4 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
});
