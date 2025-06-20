// features/addPlant/components/StepScreen.tsx
import React, { ReactNode } from 'react';
import { View } from 'react-native';

import { StepIndicatorBar } from './StepIndicatorBar';
import { ScreenLayout } from './ScreenLayout';

interface StepScreenProps {
  /**
   * Current step position (1-based)
   */
  step: number;
  
  /**
   * Background color for the screen
   */
  backgroundColor: string;
  
  /**
   * Whether to add padding above the content to account for the step indicator
   */
  paddingTopIndicator?: boolean;
  
  /**
   * Content to render inside the screen layout
   */
  children: ReactNode;
}

/**
 * Base component for all step screens in the plant addition flow
 */
export function StepScreen({ 
  step, 
  backgroundColor, 
  paddingTopIndicator = false,
  children 
}: StepScreenProps) {
  // The step indicator bar is now rendered in the AddPlantFlow component
  // This component only handles the content that should be animated
  return (
    <View style={{ flex: 1, backgroundColor }}>
      <ScreenLayout backgroundColor={backgroundColor} paddingTopIndicator={paddingTopIndicator}>
        {children}
      </ScreenLayout>
    </View>
  );
}
