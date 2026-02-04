import React from 'react';
import { StyleSheet } from 'react-native';
import { Text, Container } from '@/design-system';
import { Spacing } from '@/design-system/tokens';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export function AppHeader() {
  return (
    <Container 
      direction="row" 
      align="center" 
      justify="flex-start"
      style={styles.appHeaderModern}
    >
      <MaterialCommunityIcons 
        name="sprout" 
        size={24} 
        color="#fff" 
        style={styles.icon} 
      />
      <Text style={styles.appNameModern}>WeedGrow</Text>
      <Container style={{ flex: 1 }} />
      {/* Future: Add settings dropdown here */}
    </Container>
  );
}

const styles = StyleSheet.create({
  appHeaderModern: {
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xs,
    paddingHorizontal: Spacing.md,
    backgroundColor: 'transparent',
  },
  icon: {
    marginRight: Spacing.xs,
    opacity: 0.85,
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
