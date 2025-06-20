// design-system/tokens/colors.ts
/**
 * Design System - Color Tokens
 * Enhanced color system with semantic naming and consistent usage
 */

export const ColorTokens = {
  // Brand colors
  brand: {
    primary: '#00c853',
    primaryDark: '#00a046', 
    primaryLight: '#5dfc82',
    secondary: '#2563eb',
    accent: '#ff6b81',
  },
  
  // Grayscale
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
  
  // Status colors
  status: {
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
  },
  
  // Environment colors
  environment: {
    indoor: '#6366f1',
    outdoor: '#f59e0b',
    greenhouse: '#10b981',
  },
  
  // Background colors
  background: {
    primary: '#151718',
    secondary: '#1a2e22',
    tertiary: '#223c2b',
    overlay: 'rgba(0, 0, 0, 0.5)',
    card: '#1f2937',
    surface: '#374151',
  },
  
  // Text colors
  text: {
    primary: '#ECEDEE',
    secondary: '#B0B0B0',
    tertiary: '#888888',
    inverse: '#1f2937',
    accent: '#00c853',
  },
  
  // Border colors
  border: {
    primary: '#374151',
    secondary: '#4b5563',
    accent: '#00c853',
    error: '#ef4444',
  },
  
  // Special colors
  shadow: '#000000',
  transparent: 'transparent',
  
  // Weather/log type colors
  logTypes: {
    watering: '#06b6d4',
    feeding: '#10b981',
    pests: '#ef4444',
    training: '#8b5cf6',
    health: '#f59e0b',
    notes: '#6b7280',
  },
} as const;

// Semantic color mappings for different themes
export const ThemeColors = {
  light: {
    background: ColorTokens.gray[50],
    surface: ColorTokens.gray[100],
    text: ColorTokens.gray[900],
    textSecondary: ColorTokens.gray[600],
    border: ColorTokens.gray[300],
    primary: ColorTokens.brand.primary,
  },
  dark: {
    background: ColorTokens.background.primary,
    surface: ColorTokens.background.card,
    text: ColorTokens.text.primary,
    textSecondary: ColorTokens.text.secondary,
    border: ColorTokens.border.primary,
    primary: ColorTokens.brand.primary,
  },
} as const;
