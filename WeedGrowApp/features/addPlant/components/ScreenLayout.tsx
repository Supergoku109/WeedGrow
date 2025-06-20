// features/addPlant/components/ScreenLayout.tsx
import React from 'react';
import {
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  View,
  StyleSheet
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ScreenLayoutProps {
  children: React.ReactNode;
  backgroundColor?: string;
  scrollable?: boolean;
  paddingTopIndicator?: boolean;
}

export function ScreenLayout({
  children,
  backgroundColor = '#fff',
  scrollable = true,
  paddingTopIndicator = false
}: ScreenLayoutProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.safeArea, { backgroundColor }]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          {scrollable ? (
            <ScrollView
              contentContainerStyle={[
                styles.scrollContent,
                {
                  paddingTop: paddingTopIndicator ? 8 : 0,
                  paddingBottom: insets.bottom
                }
              ]}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentInsetAdjustmentBehavior="automatic"
            >
              {children}
            </ScrollView>
          ) : (
            <View style={[styles.flex, { paddingTop: paddingTopIndicator ? 8 : 0 }]}>
              {children}
            </View>
          )}
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  flex: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingHorizontal: 16, gap: 16 }
});
