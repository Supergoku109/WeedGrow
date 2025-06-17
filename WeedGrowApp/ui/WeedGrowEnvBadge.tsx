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

export const WeedGrowEnvBadge: React.FC<WeedGrowEnvBadgeProps> = ({ environment, size = 11, style, textStyle }) => {
  const envIcon = environment === 'indoor' ? 'home' : environment === 'outdoor' ? 'weather-sunny' : 'greenhouse';
  const envLabel = environment.charAt(0).toUpperCase() + environment.slice(1);
  return (
    <View style={[styles.badge, style, { backgroundColor: '#222', borderRadius: 10, paddingHorizontal: 4, maxWidth: 90 }]}> 
      <MaterialCommunityIcons name={envIcon} size={size} color="#fff" style={{ marginTop: 0, marginBottom: 0 }} />
      <ThemedText
        style={[styles.text, textStyle, { lineHeight: 12 }]}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {envLabel}
      </ThemedText>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 1, // less vertical space
  },
  text: {
    color: '#fff',
    fontSize: 10, // slightly smaller
    marginLeft: 2, // tighter spacing
    fontWeight: '600',
    maxWidth: 60,
    flexShrink: 1,
  },
});
