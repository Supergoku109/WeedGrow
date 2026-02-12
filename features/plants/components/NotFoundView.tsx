import React from 'react';
import { Container, Text } from '@/design-system/components';
import { useTheme } from '@/design-system/utils/useTheme';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function NotFoundView() {
  const theme = useTheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background.primary }}>
      <Container 
        style={{ flex: 1 }} 
        align="center" 
        justify="center"
      >
        <Text variant="body">Plant not found.</Text>
      </Container>
    </SafeAreaView>
  );
}
