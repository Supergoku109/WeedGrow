import { Slot } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
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

  return (
    <PaperProvider>
      <SafeAreaView style={{ flex: 1 }}>
        <Slot />
        <StatusBar style="auto" />
      </SafeAreaView>
    </PaperProvider>
  );
}
