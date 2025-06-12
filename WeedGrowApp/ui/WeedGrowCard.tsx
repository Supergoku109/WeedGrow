import React from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';
import Animated from 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

interface WeedGrowCardProps extends ViewProps {
  children: React.ReactNode;
  style?: any;
}

export function WeedGrowCard({ children, style, entering, ...rest }: WeedGrowCardProps & { entering?: any }) {
  const theme = (useColorScheme() ?? 'dark') as 'light' | 'dark';
  return (
    <Animated.View
      entering={entering}
      style={[
        styles.card,
        {
          backgroundColor: theme === 'dark' ? '#1a2e22' : '#f3f4f6',
          borderColor: theme === 'dark' ? '#223c2b' : '#e0e0e0',
        },
        style,
      ]}
      {...rest}
    >
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    paddingVertical: 28,
    paddingHorizontal: 18,
    marginTop: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOpacity: 0.16,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
    borderWidth: 1,
    alignItems: 'center',
    width: '100%',
    alignSelf: 'center',
    maxWidth: 480,
  },
});
