import { Slot } from 'expo-router';
import { PaperProvider, MD3DarkTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  const theme = {
    ...MD3DarkTheme,
    colors: {
      ...MD3DarkTheme.colors,
      primary: '#00c853',
    },
  };

  return (
    <PaperProvider theme={theme}>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#151718' }}>
        <Slot />
        <StatusBar style="light" />
      </SafeAreaView>
    </PaperProvider>
  );
}
