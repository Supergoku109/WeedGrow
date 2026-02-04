// design-system/utils/createStyles.ts
/**
 * Style Creation Utility
 * Helps create styles with design system tokens
 */

import { StyleSheet, ViewStyle, TextStyle, ImageStyle } from 'react-native';
import { useTheme } from './useTheme';

type Style = ViewStyle | TextStyle | ImageStyle;
type Styles = { [key: string]: Style };

export const createStyles = <T extends Styles>(
  styleFactory: (theme: ReturnType<typeof useTheme>) => T
) => {
  return (theme: ReturnType<typeof useTheme>) => StyleSheet.create(styleFactory(theme));
};

// Helper for responsive spacing
export const responsiveSpacing = (base: number, scale: number = 1.2) => ({
  xs: base,
  sm: base * scale,
  md: base * scale * scale,
  lg: base * scale * scale * scale,
  xl: base * scale * scale * scale * scale,
});

// Helper for responsive font sizes
export const responsiveFontSize = (base: number, scale: number = 1.125) => ({
  xs: base / (scale * scale),
  sm: base / scale,
  md: base,
  lg: base * scale,
  xl: base * scale * scale,
});
