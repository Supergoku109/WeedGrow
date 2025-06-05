import StepIndicator from 'react-native-step-indicator';
import React from 'react';

const labels = ['Basic Info', 'Environment', 'Location', 'Care', 'Photo'];

const customStyles = {
  stepIndicatorSize: 25,
  currentStepIndicatorSize: 30,
  separatorStrokeWidth: 2,
  currentStepStrokeWidth: 3,
  stepStrokeCurrentColor: 'green',
  stepStrokeWidth: 2,
  stepStrokeFinishedColor: 'green',
  stepStrokeUnFinishedColor: '#aaaaaa',
  separatorFinishedColor: 'green',
  separatorUnFinishedColor: '#aaaaaa',
  stepIndicatorFinishedColor: 'green',
  stepIndicatorUnFinishedColor: '#ffffff',
  stepIndicatorCurrentColor: 'green',
  stepIndicatorLabelFontSize: 13,
  currentStepIndicatorLabelFontSize: 13,
  stepIndicatorLabelCurrentColor: '#ffffff',
  stepIndicatorLabelFinishedColor: '#ffffff',
  stepIndicatorLabelUnFinishedColor: '#aaaaaa',
  labelColor: '#999999',
  labelSize: 11,
  currentStepLabelColor: 'green',
};

export default function StepIndicatorBar({ currentPosition }: { currentPosition: number }) {
  return (
    <StepIndicator
      customStyles={customStyles}
      currentPosition={currentPosition}
      labels={labels}
      stepCount={labels.length}
    />
  );
}
