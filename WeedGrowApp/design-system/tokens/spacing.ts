// design-system/tokens/spacing.ts
/**
 * Design System - Spacing Tokens
 * Consistent spacing values used throughout the app
 */

export const Spacing = {
  // Base spacing unit (4px)
  unit: 4,
  
  // Spacing scale
  xs: 4,     // 4px
  sm: 8,     // 8px  
  md: 16,    // 16px
  lg: 24,    // 24px
  xl: 32,    // 32px
  xxl: 48,   // 48px
  xxxl: 64,  // 64px
  
  // Semantic spacing
  elementGap: 8,
  sectionGap: 16,
  screenPadding: 20,
  cardPadding: 16,
  
  // Component specific
  buttonPadding: {
    vertical: 12,
    horizontal: 24,
  },
  inputPadding: {
    vertical: 12,
    horizontal: 16,
  },
  headerPadding: {
    vertical: 16,
    horizontal: 20,
  },
} as const;

// Helper function for spacing calculations
export const spacing = (multiplier: number) => Spacing.unit * multiplier;
