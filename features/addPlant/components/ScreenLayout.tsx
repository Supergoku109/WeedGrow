// ScreenLayout.tsx
// This component provides a consistent layout for screens in the Add Plant flow.
// It handles safe area, keyboard avoidance, optional scrolling, and optional top padding for indicator bars.

import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  View,
  StyleSheet
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

// Props for the ScreenLayout component
interface ScreenLayoutProps {
  children: React.ReactNode; // Content to render inside the layout
  backgroundColor?: string; // Optional background color
  scrollable?: boolean; // Whether to wrap content in a ScrollView
  paddingTopIndicator?: boolean; // Whether to add extra top padding (e.g. for step indicator)
}

// Main layout component for Add Plant screens
export function ScreenLayout({
  children,
  backgroundColor = '#fff',
  scrollable = true,
  paddingTopIndicator = false
}: ScreenLayoutProps) {
  return (
    // Safe area for bottom (and optionally top) insets
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]} edges={['bottom']}>
      {/* Keyboard avoiding view for input fields */}
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Dismiss keyboard when tapping outside inputs */}
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          {scrollable ? (
            // Scrollable content with optional top padding
            <ScrollView
              contentContainerStyle={[
                styles.scrollContent,
                { paddingTop: paddingTopIndicator ? 8 : 0 }
              ]}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentInsetAdjustmentBehavior="automatic"
            >
              {children}
            </ScrollView>
          ) : (
            // Non-scrollable content with optional top padding
            <View
              style={[
                styles.flex,
                { paddingTop: paddingTopIndicator ? 8 : 0 }
              ]}
            >
              {children}
            </View>
          )}
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Styles for layout containers
const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  flex: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingHorizontal: 16, gap: 16 }
});
