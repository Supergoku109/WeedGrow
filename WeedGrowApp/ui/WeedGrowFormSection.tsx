import React from 'react';
import { View, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { ThemedText } from './ThemedText';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

interface WeedGrowFormSectionProps {
  label?: string;
  renderLabel?: () => React.ReactNode; // custom label renderer
  description?: string; // optional subtitle/description
  children: React.ReactNode;
  style?: ViewStyle;
  labelStyle?: TextStyle;
  descriptionStyle?: TextStyle;
  spacing?: number; // gap between children
  horizontalSpacing?: number; // gap for row direction
  direction?: 'column' | 'row'; // layout direction
  topSpacing?: number; // extra space above section
  bottomSpacing?: number; // extra space below section
  divider?: boolean; // show divider below label
  dividerStyle?: ViewStyle;
}

export const WeedGrowFormSection: React.FC<WeedGrowFormSectionProps> = ({
  label,
  renderLabel,
  description,
  children,
  style,
  labelStyle,
  descriptionStyle,
  spacing = 14,
  horizontalSpacing = 12,
  direction = 'column',
  topSpacing = 0,
  bottomSpacing = 0,
  divider = false,
  dividerStyle,
}) => {
  const theme = (useColorScheme() ?? 'dark') as 'light' | 'dark';
  // Add fallback colors for secondaryText and divider
  const secondaryText = theme === 'light' ? '#B0B0B0' : '#B0B0B0';
  const dividerColor = theme === 'light' ? '#E0E0E0' : '#222';
  return (
    <View style={[{ marginTop: topSpacing, marginBottom: bottomSpacing }, style]}>
      {renderLabel ? (
        renderLabel()
      ) : label ? (
        <ThemedText type="subtitle" style={[styles.label, { color: Colors[theme].tint }, labelStyle]}>
          {label}
        </ThemedText>
      ) : null}
      {!!description && (
        <ThemedText type="default" style={[styles.description, { color: secondaryText }, descriptionStyle]}>
          {description}
        </ThemedText>
      )}
      {divider && (
        <View style={[styles.divider, { backgroundColor: dividerColor }, dividerStyle]} />
      )}
      <View
        style={
          direction === 'row'
            ? { flexDirection: 'row', alignItems: 'center', gap: horizontalSpacing, width: '100%' }
            : { gap: spacing, width: '100%' }
        }
      >
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  label: {
    fontWeight: '600',
    fontSize: 16,
    marginBottom: 6,
    marginLeft: 2,
  },
  description: {
    fontSize: 13,
    marginBottom: 4,
    marginLeft: 2,
  },
  divider: {
    height: 1,
    width: '100%',
    marginBottom: 10,
    marginTop: 2,
    opacity: 0.18,
    borderRadius: 1,
  },
});
