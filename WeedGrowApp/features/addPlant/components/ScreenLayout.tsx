// features/addPlant/components/ScreenLayout.tsx

import React from 'react';
import {
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  ViewStyle
} from 'react-native';

interface ScreenLayoutProps {
  children: React.ReactNode;
  backgroundColor: string;
  paddingTopIndicator?: boolean;
}

export function ScreenLayout({
  children,
  backgroundColor,
  paddingTopIndicator = false
}: ScreenLayoutProps) {
  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor,
        paddingTop: paddingTopIndicator ? 8 : 0
      }}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              padding: 16,
              gap: 16
            }}
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
