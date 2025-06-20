import React, { useState, useEffect } from 'react';
import DropDownPicker from 'react-native-dropdown-picker';
import { View, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Text, Container, useTheme } from '@/design-system';
import { Spacing, BorderRadius } from '@/design-system/tokens';

interface WeedGrowDropdownInputProps {
  icon?: string;
  value: string;
  label: string;
  options: Array<{ label: string; value: string }>;
  onSelect: (value: string) => void;
  placeholder?: string;
  zIndex?: number;
}

export function WeedGrowDropdownInput({
  icon,
  value,
  label,
  options,
  onSelect,
  placeholder,
  zIndex = 1000,
}: WeedGrowDropdownInputProps) {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState(options);

  useEffect(() => {
    setItems(options);
  }, [options]);

  return (
    <Container style={{ zIndex, marginBottom: Spacing.md }}>
      <Container direction="row" align="center" style={{ marginBottom: Spacing.xs }}>
        {icon && (
          <MaterialCommunityIcons
            name={icon as any}
            size={18}
            color={theme.colors.text.primary}
            style={{ marginRight: Spacing.xs }}
          />
        )}
        <Text variant="label" color="primary">{label}</Text>
      </Container>

      <DropDownPicker
        open={open}
        value={value}
        items={items}
        setOpen={setOpen}
        setValue={(callback) => onSelect(callback(value))}
        setItems={setItems}
        placeholder={placeholder}
        style={[
          styles.dropdown,
          {
            backgroundColor: theme.colors.background.secondary,
            borderColor: theme.colors.border.primary,
          }
        ]}
        textStyle={{
          color: theme.colors.text.primary,
          fontSize: 16,
        }}
        dropDownContainerStyle={[
          styles.dropdownContainer,
          {
            backgroundColor: theme.colors.background.secondary,
            borderColor: theme.colors.border.primary,
          }
        ]}
        listItemLabelStyle={{
          color: theme.colors.text.primary,
        }}
        ArrowDownIconComponent={({ style }: { style?: any }) => (
          <MaterialCommunityIcons 
            name="chevron-down" 
            size={20} 
            color={theme.colors.text.secondary} 
            style={style} 
          />
        )}
        listMode="SCROLLVIEW"
      />
    </Container>
  );
}

const styles = StyleSheet.create({
  dropdown: {
    height: 52,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.sm,
  },
  dropdownContainer: {
    borderRadius: BorderRadius.md,
  },
});
