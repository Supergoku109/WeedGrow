// design-system/utils/useTheme.ts
/**
 * Enhanced Theme Hook
 * Provides easy access to design tokens with theme awareness
 */

import { useColorScheme } from '@/hooks/useColorScheme';
import { ColorTokens, ThemeColors, Spacing, Typography, BorderRadius, Shadows } from '../tokens';

export interface Theme {
  colors: typeof ColorTokens & { theme: typeof ThemeColors.dark | typeof ThemeColors.light };
  spacing: typeof Spacing;
  typography: typeof Typography;
  radius: typeof BorderRadius;
  shadows: typeof Shadows;
  isDark: boolean;
}

export const useTheme = (): Theme => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  return {
    colors: {
      ...ColorTokens,
      theme: isDark ? ThemeColors.dark : ThemeColors.light,
    },
    spacing: Spacing,
    typography: Typography,
    radius: BorderRadius,
    shadows: Shadows,
    isDark,
  };
};
