import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from './ThemedText';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export interface WeedGrowEnvBadgeProps {
  environment: 'indoor' | 'outdoor' | 'greenhouse' | string;
  size?: number; // icon size
  style?: any;
  textStyle?: any;
}

export const WeedGrowEnvBadge: React.FC<WeedGrowEnvBadgeProps> = ({ environment, size = 12, style, textStyle }) => {
  const envIcon = environment === 'indoor' ? 'home' : environment === 'outdoor' ? 'weather-sunny' : 'greenhouse';
  const envLabel = environment.charAt(0).toUpperCase() + environment.slice(1);
  return (
    <View style={[styles.badge, style, { backgroundColor: '#222', borderRadius: 10, paddingHorizontal: 6 }]}>
      <MaterialCommunityIcons name={envIcon} size={size} color="#fff" />
      <ThemedText style={[styles.text, textStyle]}>{envLabel}</ThemedText>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 1,
  },
  text: {
    color: '#fff',
    fontSize: 11,
    marginLeft: 3,
    fontWeight: '600',
  },
});
