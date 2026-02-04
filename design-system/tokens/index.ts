// design-system/tokens/index.ts
/**
 * Design System Tokens - Central Export
 */

import { Spacing } from './spacing';
import { Typography } from './typography';
import { ColorTokens } from './colors';
import { BorderRadius } from './radius';
import { Shadows } from './shadows';

export { Spacing, spacing } from './spacing';
export { Typography } from './typography';
export { ColorTokens, ThemeColors } from './colors';
export { BorderRadius } from './radius';
export { Shadows } from './shadows';

// Combined theme object for easy access

export const DesignTokens = {
  spacing: Spacing,
  typography: Typography,
  colors: ColorTokens,
  radius: BorderRadius,
  shadows: Shadows,
} as const;
