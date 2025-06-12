import React from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';

interface WeedGrowButtonRowProps extends ViewProps {
  children: React.ReactNode;
  style?: any;
}

export function WeedGrowButtonRow({ children, style, ...rest }: WeedGrowButtonRowProps) {
  return (
    <View
      style={[styles.row, style]}
      {...rest}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 32,
    gap: 16,
    width: '100%',
  },
});
