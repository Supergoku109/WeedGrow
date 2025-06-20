import React from 'react';
import { View, ViewStyle, TextStyle } from 'react-native';
import { Text, Container } from '@/design-system/components';
import { Spacing, ColorTokens } from '@/design-system/tokens';
import { useColorScheme } from '@/hooks/useColorScheme';

interface WeedGrowFormSectionProps {
  label?: string;
  renderLabel?: () => React.ReactNode; // custom label renderer
  description?: string; // optional subtitle/description
  children: React.ReactNode;
  style?: ViewStyle;
  labelStyle?: TextStyle;
  descriptionStyle?: TextStyle;
  spacing?: number; // gap between children
  horizontalSpacing?: number; // gap for row direction
  direction?: 'column' | 'row'; // layout direction
  topSpacing?: number; // extra space above section
  bottomSpacing?: number; // extra space below section
  divider?: boolean; // show divider below label
  dividerStyle?: ViewStyle;
}

export const WeedGrowFormSection: React.FC<WeedGrowFormSectionProps> = ({
  label,
  renderLabel,
  description,
  children,
  style,
  labelStyle,
  descriptionStyle,
  spacing = Spacing.md,
  horizontalSpacing = Spacing.md,
  direction = 'column',
  topSpacing = 0,
  bottomSpacing = 0,
  divider = false,
  dividerStyle,
}) => {
  const theme = (useColorScheme() ?? 'dark') as 'light' | 'dark';
  const dividerColor = theme === 'light' ? ColorTokens.gray[300] : ColorTokens.border.primary;

  return (
    <Container
      style={[
        { 
          marginTop: topSpacing, 
          marginBottom: bottomSpacing,
        }, 
        style
      ]}
    >
      {renderLabel ? (
        renderLabel()
      ) : label ? (
        <Text 
          variant="label" 
          color="accent"
          style={[
            { 
              marginBottom: Spacing.xs,
              marginLeft: 2,
            }, 
            labelStyle
          ]}
        >
          {label}
        </Text>
      ) : null}
      
      {!!description && (
        <Text 
          variant="caption" 
          color="secondary"
          style={[
            { 
              marginBottom: Spacing.xs,
              marginLeft: 2,
            }, 
            descriptionStyle
          ]}
        >
          {description}
        </Text>
      )}
      
      {divider && (
        <View 
          style={[
            {
              height: 1,
              width: '100%',
              marginBottom: Spacing.sm,
              marginTop: 2,
              backgroundColor: dividerColor,
              opacity: 0.18,
              borderRadius: 1,
            }, 
            dividerStyle
          ]} 
        />
      )}
      
      <Container
        direction={direction}
        gap={direction === 'row' ? horizontalSpacing : spacing}
        align={direction === 'row' ? 'center' : 'stretch'}
        style={{ width: '100%' }}
      >
        {children}
      </Container>
    </Container>
  );
};
