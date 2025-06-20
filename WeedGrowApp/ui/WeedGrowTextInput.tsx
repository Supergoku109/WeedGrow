import React from 'react';
import { Input } from '@/design-system/components';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface WeedGrowTextInputProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  keyboardType?: 'default' | 'numeric' | 'email-address';
  secureTextEntry?: boolean;
  error?: string;
  helper?: string;
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
  error,
  helper,
  multiline = false,
}: WeedGrowTextInputProps) {
  return (
    <Input
      label={label}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      icon={icon}
      keyboardType={keyboardType}
      secureTextEntry={secureTextEntry}
      error={error}
      helper={helper}
      multiline={multiline}
      variant="outlined"
    />
  );
}
