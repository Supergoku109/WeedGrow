import React from 'react';
import { SafeAreaView } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import { Container } from '@/design-system/components';
import { useTheme } from '@/design-system/utils/useTheme';

export default function LoadingView() {
  const theme = useTheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background.primary }}>
      <Container 
        style={{ flex: 1 }} 
        align="center" 
        justify="center"
      >
        <ActivityIndicator color={theme.colors.brand.primary} />
      </Container>
    </SafeAreaView>
  );
}
