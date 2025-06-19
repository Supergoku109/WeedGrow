import React from 'react';
import { TextInput, View, StyleSheet } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface WeedGrowTextInputProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  icon?: string;
  keyboardType?: 'default' | 'numeric' | 'email-address';
  secureTextEntry?: boolean;
  error?: boolean;
  multiline?: boolean;
}

export function WeedGrowTextInput({
  label,
  value,
  onChangeText,
  placeholder,
  icon,
  keyboardType = 'default',
  secureTextEntry = false,
  error = false,
  multiline = false,
}: WeedGrowTextInputProps) {
  const scheme = (useColorScheme() ?? 'dark') as 'light' | 'dark';
  const themeColors = Colors[scheme];

  const borderColor = error ? 'red' : themeColors.tint;

  return (
    <View style={[styles.container, { borderColor }]}>
      {icon && (
        <MaterialCommunityIcons
          name={icon as any}
          size={20}
          color={themeColors.text}
          style={styles.icon}
        />
      )}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#b5eec5"
        style={[styles.input, { color: themeColors.text }]}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        multiline={multiline}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#1a2e22', // You can replace with theme background
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 0,
  },
});
