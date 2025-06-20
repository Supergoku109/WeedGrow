/**
 * Legacy Colors - Deprecated
 * Use design-system/tokens/colors.ts instead
 * This file is kept for backwards compatibility during migration
 */

import { ColorTokens, ThemeColors } from '@/design-system/tokens/colors';

const tintColorLight = ColorTokens.brand.primary;
const tintColorDark = ColorTokens.brand.primary;
export const calendarGreen = ColorTokens.logTypes.feeding;
const grayColor = ColorTokens.text.secondary;
const labelColor = ColorTokens.text.tertiary;
const whiteColor = ColorTokens.text.primary;

export const Colors = {
  light: {
    text: ThemeColors.light.text,
    background: ThemeColors.light.background,
    tint: tintColorLight,
    icon: tintColorLight,
    tabIconDefault: tintColorLight,
    tabIconSelected: tintColorLight,
    gray: grayColor,
    label: labelColor,
    white: whiteColor,
  },
  dark: {
    text: ThemeColors.dark.text,
    background: ThemeColors.dark.background,
    tint: tintColorDark,
    icon: tintColorDark,
    tabIconDefault: tintColorDark,
    tabIconSelected: tintColorDark,
    gray: grayColor,
    label: labelColor,
    white: whiteColor,
  },
};
