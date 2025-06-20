// features/addPlant/hooks/useStepBackground.ts
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

/**
 * Hook to get the standard background color for step screens
 * based on the current color scheme
 */
export function useStepBackground(): string {
  const scheme = (useColorScheme() ?? 'dark') as 'light' | 'dark';
  return Colors[scheme].background;
}
