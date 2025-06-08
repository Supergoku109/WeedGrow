import StepIndicator from 'react-native-step-indicator';
import React from 'react';
import { View } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

const labels = ['Basic Info', 'Environment', 'Location', 'Care', 'Photo'];

export default function StepIndicatorBar({ currentPosition }: { currentPosition: number }) {
  const theme = useColorScheme() ?? 'dark';

  // Styling for the step indicator component from react-native-step-indicator
  // Colors are pulled from our theme so the bar adapts to light/dark mode.
  const customStyles = {
    stepIndicatorSize: 25,
    currentStepIndicatorSize: 30,
    separatorStrokeWidth: 2,
    currentStepStrokeWidth: 3,
    stepStrokeCurrentColor: Colors[theme].tint,
    stepStrokeWidth: 2,
    stepStrokeFinishedColor: Colors[theme].tint,
    stepStrokeUnFinishedColor: Colors[theme].gray,
    separatorFinishedColor: Colors[theme].tint,
    separatorUnFinishedColor: Colors[theme].gray,
    stepIndicatorFinishedColor: Colors[theme].tint,
    stepIndicatorUnFinishedColor: Colors[theme].white,
    stepIndicatorCurrentColor: Colors[theme].tint,
    stepIndicatorLabelFontSize: 13,
    currentStepIndicatorLabelFontSize: 13,
    stepIndicatorLabelCurrentColor: Colors[theme].white,
    stepIndicatorLabelFinishedColor: Colors[theme].white,
    stepIndicatorLabelUnFinishedColor: Colors[theme].gray,
    labelColor: Colors[theme].label,
    labelSize: 11,
    currentStepLabelColor: Colors[theme].tint,
  } as const;

  return (
    <View style={{ marginBottom: 16 }}>
      <StepIndicator
        customStyles={customStyles}
        currentPosition={currentPosition}
        labels={labels}
        stepCount={labels.length}
      />
    </View>
  );
}
