// design-system/components/Row/Row.tsx
/**
 * Row Component for horizontal layouts
 */

import React from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';
import { Spacing } from '../../tokens';

export interface RowProps extends ViewProps {
  align?: 'flex-start' | 'center' | 'flex-end' | 'stretch';
  justify?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly';
  gap?: keyof typeof Spacing;
  wrap?: boolean;
}

export const Row: React.FC<RowProps> = ({
  align = 'center',
  justify = 'flex-start',
  gap,
  wrap = false,
  style,
  children,
  ...props
}) => {
  const gapValue = gap && typeof Spacing[gap] === 'number' ? Spacing[gap] : undefined;
  
  const rowStyle = StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: align,
      justifyContent: justify,
      flexWrap: wrap ? 'wrap' : 'nowrap',
      gap: gapValue,
    }
  }).row;

  return (
    <View style={[rowStyle, style]} {...props}>
      {children}
    </View>
  );
};
