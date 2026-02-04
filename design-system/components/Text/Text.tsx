// design-system/components/Text/Text.tsx
/**
 * Enhanced Text Component with Design System Integration
 * Replaces ThemedText with more consistent styling
 */

import React from 'react';
import { Text as RNText, TextProps as RNTextProps, StyleSheet } from 'react-native';
import { Typography, ColorTokens } from '../../tokens';
import { useColorScheme } from '@/hooks/useColorScheme';

export interface TextProps extends RNTextProps {
  variant?: keyof typeof Typography.styles;
  color?: 'primary' | 'secondary' | 'tertiary' | 'accent' | 'inverse';
  align?: 'left' | 'center' | 'right';
  weight?: keyof typeof Typography.weights;
  size?: keyof typeof Typography.sizes;
}

export const Text: React.FC<TextProps> = ({
  variant = 'body',
  color = 'primary',
  align = 'left',
  weight,
  size,
  style,
  children,
  ...props
}) => {
  const colorScheme = useColorScheme();
  
  const textColor = React.useMemo(() => {
    switch (color) {
      case 'primary':
        return ColorTokens.text.primary;
      case 'secondary':
        return ColorTokens.text.secondary;
      case 'tertiary':
        return ColorTokens.text.tertiary;
      case 'accent':
        return ColorTokens.text.accent;
      case 'inverse':
        return ColorTokens.text.inverse;
      default:
        return ColorTokens.text.primary;
    }
  }, [color]);

  const textStyle = React.useMemo(() => {
    const baseStyle = Typography.styles[variant];
    return [
      baseStyle,
      {
        color: textColor,
        textAlign: align,
        ...(weight && { fontWeight: Typography.weights[weight] }),
        ...(size && { fontSize: Typography.sizes[size] }),
      },
      style,
    ];
  }, [variant, textColor, align, weight, size, style]);

  return (
    <RNText style={textStyle} {...props}>
      {children}
    </RNText>
  );
};

// Predefined text variants for common use cases
export const Heading1: React.FC<Omit<TextProps, 'variant'>> = (props) => (
  <Text variant="h1" {...props} />
);

export const Heading2: React.FC<Omit<TextProps, 'variant'>> = (props) => (
  <Text variant="h2" {...props} />
);

export const Heading3: React.FC<Omit<TextProps, 'variant'>> = (props) => (
  <Text variant="h3" {...props} />
);

export const Body: React.FC<Omit<TextProps, 'variant'>> = (props) => (
  <Text variant="body" {...props} />
);

export const Caption: React.FC<Omit<TextProps, 'variant'>> = (props) => (
  <Text variant="caption" {...props} />
);

export const Label: React.FC<Omit<TextProps, 'variant'>> = (props) => (
  <Text variant="label" {...props} />
);
