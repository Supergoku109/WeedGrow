import React from 'react';
import { View, ViewProps } from 'react-native';
import { ColorTokens } from '@/design-system/tokens';
import { useColorScheme } from '@/hooks/useColorScheme';

export function WeedGrowDivider({ style, ...rest }: ViewProps) {
  const theme = (useColorScheme() ?? 'dark') as 'light' | 'dark';
  
  const dividerColor = theme === 'dark' 
    ? ColorTokens.border.primary 
    : ColorTokens.border.secondary;
  
  return (
    <View
      style={[
        {
          height: 1,
          marginVertical: 10,
          opacity: 0.2,
          width: '100%',
          backgroundColor: dividerColor,
        },
        style,
      ]}
      {...rest}
    />
  );
}
