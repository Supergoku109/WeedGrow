import StepIndicator from 'react-native-step-indicator';
import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const labels = ['Basic Info', 'Environment', 'Location', 'Care', 'Photo'];

const customStyles = {
  stepIndicatorSize: 25,
  currentStepIndicatorSize: 30,
  separatorStrokeWidth: 2,
  currentStepStrokeWidth: 3,
  stepStrokeCurrentColor: '#00c853',
  stepStrokeWidth: 2,
  stepStrokeFinishedColor: '#00c853',
  stepStrokeUnFinishedColor: '#aaaaaa',
  separatorFinishedColor: '#00c853',
  separatorUnFinishedColor: '#aaaaaa',
  stepIndicatorFinishedColor: '#00c853',
  stepIndicatorUnFinishedColor: '#ffffff',
  stepIndicatorCurrentColor: '#00c853',
  stepIndicatorLabelFontSize: 13,
  currentStepIndicatorLabelFontSize: 13,
  stepIndicatorLabelCurrentColor: '#ffffff',
  stepIndicatorLabelFinishedColor: '#ffffff',
  stepIndicatorLabelUnFinishedColor: '#aaaaaa',
  labelColor: '#999999',
  labelSize: 11,
  currentStepLabelColor: '#00c853',
};

export default function StepIndicatorBar({ currentPosition }: { currentPosition: number }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ marginTop: insets.top + 8, marginBottom: 16 }}>
      <StepIndicator
        customStyles={customStyles}
        currentPosition={currentPosition}
        labels={labels}
        stepCount={labels.length}
      />
    </View>
  );
}
