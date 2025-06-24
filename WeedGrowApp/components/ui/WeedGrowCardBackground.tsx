import React from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface WeedGrowCardBackgroundProps extends ViewProps {
  children: React.ReactNode;
  style?: any;
}

export function WeedGrowCardBackground({ children, style, ...rest }: WeedGrowCardBackgroundProps) {
  return (
    <View style={[styles.container, style]} {...rest}>
      {/* Reference-inspired green bloom background */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {/* Very large, circular yellow-green highlight (bottom left, strong arc) */}
        <LinearGradient
          colors={["#eaffb0", "#baffba88", "#4caf5000"]}
          locations={[0, 0.3, 1]}
          start={{ x: 0.05, y: 1 }}
          end={{ x: 0.7, y: 0.2 }}
          style={styles.bigCircle}
        />
        {/* Wide, soft green base glow */}
        <LinearGradient
          colors={["#4caf5044", "#232a2500"]}
          start={{ x: 0.5, y: 1 }}
          end={{ x: 0.5, y: 0 }}
          style={styles.baseGlow}
        />
        {/* Subtle, wide green overlay for overall color blending */}
        <LinearGradient
          colors={["#232a25", "#355c3a", "#4caf5022"]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      </View>
      <View style={[{ flex: 1, zIndex: 1 }, style]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  bigCircle: {
    position: 'absolute',
    left: -250,
    bottom: -180,
    width: 800,
    height: 800,
    borderRadius: 800,
    opacity: 0.55,
    transform: [{ rotate: '-18deg' }],
  },
  baseGlow: {
    position: 'absolute',
    left: '-20%',
    right: '-20%',
    bottom: 0,
    height: '60%',
    borderTopLeftRadius: 300,
    borderTopRightRadius: 300,
    opacity: 0.6,
  },
});
