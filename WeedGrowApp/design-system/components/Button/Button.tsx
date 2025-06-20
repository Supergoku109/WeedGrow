// design-system/components/Button/Button.tsx
/**
 * Enhanced Button Component with Design System Integration
 * Provides consistent button styles and variants
 */

import React from 'react';
import {
  TouchableOpacity,
  TouchableOpacityProps,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { Text } from '../Text/Text';
import { ColorTokens, Spacing, BorderRadius, Shadows, Typography } from '../../tokens';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export interface ButtonProps extends Omit<TouchableOpacityProps, 'style'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  iconPosition?: 'left' | 'right';
  children: React.ReactNode;
  style?: any;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  icon,
  iconPosition = 'left',
  disabled,
  children,
  style,
  ...props
}) => {
  const buttonStyle = React.useMemo(() => {
    const baseStyle: any = {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: BorderRadius.button,
      ...Shadows.button,
    };

    // Size variations
    switch (size) {
      case 'sm':
        baseStyle.paddingVertical = Spacing.sm;
        baseStyle.paddingHorizontal = Spacing.md;
        baseStyle.minHeight = 36;
        break;
      case 'lg':
        baseStyle.paddingVertical = Spacing.md;
        baseStyle.paddingHorizontal = Spacing.xl;
        baseStyle.minHeight = 56;
        break;
      default: // md
        baseStyle.paddingVertical = Spacing.buttonPadding.vertical;
        baseStyle.paddingHorizontal = Spacing.buttonPadding.horizontal;
        baseStyle.minHeight = 48;
        break;
    }

    // Variant styles
    switch (variant) {
      case 'primary':
        baseStyle.backgroundColor = ColorTokens.brand.primary;
        break;
      case 'secondary':
        baseStyle.backgroundColor = ColorTokens.brand.secondary;
        break;
      case 'outline':
        baseStyle.backgroundColor = 'transparent';
        baseStyle.borderWidth = 1;
        baseStyle.borderColor = ColorTokens.brand.primary;
        break;
      case 'ghost':
        baseStyle.backgroundColor = 'transparent';
        baseStyle.shadowOpacity = 0;
        baseStyle.elevation = 0;
        break;
      case 'danger':
        baseStyle.backgroundColor = ColorTokens.status.error;
        break;
    }

    // Full width
    if (fullWidth) {
      baseStyle.width = '100%';
    }

    // Disabled state
    if (disabled || loading) {
      baseStyle.opacity = 0.6;
    }

    return [baseStyle, style];
  }, [variant, size, fullWidth, disabled, loading, style]);

  const textColor = React.useMemo(() => {
    if (variant === 'outline' || variant === 'ghost') {
      return ColorTokens.brand.primary;
    }
    return ColorTokens.text.primary;
  }, [variant]);

  const iconSize = React.useMemo(() => {
    switch (size) {
      case 'sm':
        return 16;
      case 'lg':
        return 24;
      default:
        return 20;
    }
  }, [size]);

  const renderContent = () => {
    if (loading) {
      return <ActivityIndicator color={textColor} size="small" />;
    }

    const textElement = (
      <Text
        variant="button"
        style={{ color: textColor, fontSize: size === 'sm' ? 14 : size === 'lg' ? 18 : 16 }}
      >
        {children}
      </Text>
    );

    if (icon) {
      const iconElement = (
        <MaterialCommunityIcons
          name={icon}
          size={iconSize}
          color={textColor}
          style={{ marginHorizontal: Spacing.xs }}
        />
      );

      return iconPosition === 'left' ? (
        <>
          {iconElement}
          {textElement}
        </>
      ) : (
        <>
          {textElement}
          {iconElement}
        </>
      );
    }

    return textElement;
  };

  return (
    <TouchableOpacity
      style={buttonStyle}
      disabled={disabled || loading}
      activeOpacity={0.8}
      {...props}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};
