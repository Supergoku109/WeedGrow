import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from './ThemedText';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export function AppHeader() {
  return (
    <View style={styles.appHeaderModern}>
      <MaterialCommunityIcons name="sprout" size={24} color="#fff" style={{ marginRight: 8, opacity: 0.85 }} />
      <ThemedText style={styles.appNameModern}>WeedGrow</ThemedText>
      <View style={{ flex: 1 }} />
      {/* Future: Add settings dropdown here */}
    </View>
  );
}

const styles = StyleSheet.create({
  appHeaderModern: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start', // left align
    paddingTop: 12,
    paddingBottom: 8,
    paddingHorizontal: 16,
    backgroundColor: 'transparent', // no background
    marginBottom: 0,
  },
  appNameModern: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 2,
    textShadowColor: 'rgba(0,0,0,0.10)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
    opacity: 0.95,
  },
});

export default AppHeader;
