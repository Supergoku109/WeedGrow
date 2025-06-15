import React, { useState, useEffect } from 'react';
import DropDownPicker from 'react-native-dropdown-picker';
import { View, StyleSheet, Text } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface WeedGrowDropdownInputProps {
  icon?: string;
  value: string;
  label: string;
  options: Array<{ label: string; value: string }>;
  onSelect: (value: string) => void;
  placeholder?: string;
}

export function WeedGrowDropdownInput({
  icon,
  value,
  label,
  options,
  onSelect,
  placeholder,
}: WeedGrowDropdownInputProps) {
  const scheme = (useColorScheme() ?? 'dark') as 'light' | 'dark';
  const themeColors = Colors[scheme];

  const [open, setOpen] = useState(false);
  const [items, setItems] = useState(options);

  useEffect(() => {
    setItems(options);
  }, [options]);

  return (
    <View style={{ zIndex: 1000, marginBottom: 16 }}>
      <View style={styles.labelContainer}>
        {icon && (
          <MaterialCommunityIcons
            name={icon as any}
            size={18}
            color={themeColors.text}
            style={{ marginRight: 6 }}
          />
        )}
        <Text style={[styles.label, { color: themeColors.text }]}>{label}</Text>
      </View>

      <DropDownPicker
        open={open}
        value={value}
        items={items}
        setOpen={setOpen}
        setValue={(callback) => onSelect(callback(value))}
        setItems={setItems}
        placeholder={placeholder}
        style={{
          backgroundColor: '#1a2e22',
          borderColor: themeColors.tint,
          height: 52,
        }}
        textStyle={{
          color: themeColors.text,
          fontSize: 16,
        }}
        dropDownContainerStyle={{
          backgroundColor: '#1a2e22',
          borderColor: themeColors.tint,
        }}
        listItemLabelStyle={{
          color: themeColors.text,
        }}
        ArrowDownIconComponent={({ style }: { style?: any }) => (
          <MaterialCommunityIcons name="chevron-down" size={20} color="#fff" style={style} />
        )}
        tickIconStyle={{}}
        listMode="SCROLLVIEW"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
});
