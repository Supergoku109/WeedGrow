import React from 'react';
import { TouchableOpacity } from 'react-native';
import * as Haptics from 'expo-haptics';

export function HapticTab({ children, ...props }: any) {
  return (
    <TouchableOpacity
      {...props}
      onPress={async (e) => {
        if (props.onPress) props.onPress(e);
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }}
    >
      {children}
    </TouchableOpacity>
  );
}
