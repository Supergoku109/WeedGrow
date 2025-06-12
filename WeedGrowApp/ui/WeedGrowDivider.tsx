import React from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';

export function WeedGrowDivider({ style, ...rest }: ViewProps) {
  const theme = (useColorScheme() ?? 'dark') as 'light' | 'dark';
  return (
    <View
      style={[
        styles.divider,
        {
          backgroundColor: theme === 'dark' ? '#223c2b' : '#e0e0e0',
        },
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  divider: {
    height: 1,
    marginVertical: 10,
    opacity: 0.2,
    width: '100%',
  },
});
