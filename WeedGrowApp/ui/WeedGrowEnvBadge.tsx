import React from 'react';
import { View } from 'react-native';
import { Row, Text } from '@/design-system/components';
import { ColorTokens, Spacing, BorderRadius } from '@/design-system/tokens';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export interface WeedGrowEnvBadgeProps {
  environment: 'indoor' | 'outdoor' | 'greenhouse' | string;
  size?: number; // icon size
  style?: any;
  textStyle?: any;
}

export const WeedGrowEnvBadge: React.FC<WeedGrowEnvBadgeProps> = ({ 
  environment, 
  size = 12, 
  style, 
  textStyle 
}) => {
  const envIcon = environment === 'indoor' ? 'home' : environment === 'outdoor' ? 'weather-sunny' : 'greenhouse';
  const envLabel = environment.charAt(0).toUpperCase() + environment.slice(1);
  
  const backgroundColor = ColorTokens.environment[environment as keyof typeof ColorTokens.environment] || ColorTokens.gray[700];
  
  return (
    <Row 
      style={[
        {
          backgroundColor,
          borderRadius: BorderRadius.badge,
          paddingHorizontal: Spacing.xs,
          paddingVertical: 1,
        }, 
        style
      ]}
      align="center"
      gap="xs"
    >
      <MaterialCommunityIcons name={envIcon as any} size={size} color="#fff" />
      <Text 
        variant="caption" 
        style={[
          { 
            color: '#fff',
            fontWeight: '600',
            fontSize: 11,
          }, 
          textStyle
        ]}
      >
        {envLabel}
      </Text>
    </Row>
  );
};
