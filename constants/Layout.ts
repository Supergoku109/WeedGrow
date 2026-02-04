/**
 * Layout Constants
 * Enhanced with design system integration
 */

import { Spacing } from '@/design-system/tokens/spacing';

// Header dimensions
export const HEADER_MAX_HEIGHT = 220;
export const GALLERY_BAR_HEIGHT = 96;
export const HEADER_MIN_HEIGHT = GALLERY_BAR_HEIGHT;

// Common component dimensions
export const BUTTON_HEIGHT = {
  sm: 36,
  md: 48,
  lg: 56,
} as const;

export const INPUT_HEIGHT = {
  sm: 40,
  md: 48,
  lg: 56,
} as const;

// Avatar sizes
export const AVATAR_SIZE = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 48,
  xl: 64,
  xxl: 80,
} as const;

// Card dimensions
export const CARD_DIMENSIONS = {
  minHeight: 80,
  borderWidth: 1,
  padding: Spacing.cardPadding,
} as const;

// Screen dimensions helpers
export const SCREEN_PADDING = Spacing.screenPadding;
export const SECTION_GAP = Spacing.sectionGap;
