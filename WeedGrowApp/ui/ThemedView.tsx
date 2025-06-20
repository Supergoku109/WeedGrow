import { View, type ViewProps } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Container } from '@/design-system';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

export function ThemedView({ style, lightColor, darkColor, ...otherProps }: ThemedViewProps) {
  // If custom colors are provided, use legacy approach for backward compatibility
  if (lightColor || darkColor) {
    const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');
    return <View style={[{ backgroundColor }, style]} {...otherProps} />;
  }
  
  // Use design system Container for consistent styling
  return <Container style={style} {...otherProps} />;
}

export default ThemedView;
