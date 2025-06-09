import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export function IconSymbol({ name, size, color }: { name: string; size: number; color: string }) {
  // Map your custom icon names to the correct icon set and name
  switch (name) {
    case 'leaf.fill':
      return <Ionicons name="leaf" size={size} color={color} />;
    case 'house.fill':
      return <MaterialCommunityIcons name="home" size={size} color={color} />;
    case 'book.fill':
      return <Ionicons name="book" size={size} color={color} />;
    case 'ellipsis.circle':
      return <Ionicons name="ellipsis-horizontal-circle" size={size} color={color} />;
    default:
      return <Ionicons name="help-circle" size={size} color={color} />;
  }
}
