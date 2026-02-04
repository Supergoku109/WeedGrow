import React from 'react';
import { ViewProps } from 'react-native';
import { Row } from '@/design-system/components';
import { Spacing } from '@/design-system/tokens';

interface WeedGrowButtonRowProps extends ViewProps {
  children: React.ReactNode;
  gap?: keyof typeof Spacing;
  align?: 'flex-start' | 'center' | 'flex-end' | 'stretch';
  justify?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly';
}

export function WeedGrowButtonRow({ 
  children, 
  gap = 'md',
  align = 'center',
  justify = 'center',
  style,
  ...props 
}: WeedGrowButtonRowProps) {
  return (
    <Row
      gap={gap}
      align={align}
      justify={justify}
      style={[{ marginTop: Spacing.xl, width: '100%' }, style]}
      {...props}
    >
      {children}
    </Row>
  );
}
