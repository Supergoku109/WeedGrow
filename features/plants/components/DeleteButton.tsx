import React from 'react';
import { IconButton } from 'react-native-paper';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

interface DeleteButtonProps {
  onDelete: () => void;
  insets: { top: number };
}

export default function DeleteButton({ onDelete, insets }: DeleteButtonProps) {
  const theme = (useColorScheme() ?? 'dark') as keyof typeof Colors;

  return (
    <IconButton
      icon="delete"
      mode="contained"
      iconColor={Colors[theme].white}
      containerColor={Colors[theme].tint}
      onPress={onDelete}
      style={{ position: 'absolute', top: insets.top + 12, right: 16, zIndex: 30 }}
    />
  );
}
