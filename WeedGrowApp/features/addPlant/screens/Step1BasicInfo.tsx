// features/addPlant/screens/Step1BasicInfo.tsx
// This screen renders the first step of the Add Plant flow: entering basic plant information.
// It uses the BasicInfoForm and step logic, and handles navigation between steps.

import React from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';

import { StepScreen } from '@/features/addPlant/components/StepScreen';
import { BasicInfoForm } from '@/features/addPlant/components/BasicInfoForm';
import { useStep1BasicInfo } from '@/features/addPlant/hooks/useStep1BasicInfo';
import { StepProps } from '@/features/addPlant/types/StepProps';

export default function Step1BasicInfo({
  form, setField, next, back, step
}: StepProps) {
  // Get logic for this step
  const logic = useStep1BasicInfo(form, setField);
  const router = useRouter();
  const { tabIndex } = useLocalSearchParams<{ tabIndex: string }>();

  // Helper to navigate to home with correct tab (not used in this step)
  const navigateToHome = () => {
    // Navigate back to the home screen with the correct tab index
    if (tabIndex) {
      router.replace({ pathname: '/(tabs)', params: { tabIndex } });
    } else {
      // If no tabIndex is provided, default to the plants tab (index 1)
      router.replace({ pathname: '/(tabs)', params: { tabIndex: '1' } });
    }
  };

  // Render the step screen and form
  return (
    <StepScreen 
      step={step}
      backgroundColor={logic.backgroundColor}
      paddingTopIndicator
    >
      <BasicInfoForm
        form={form}
        logic={logic}
        next={next}
        back={back} // Use the step navigation back, not navigateToHome
      />
    </StepScreen>
  );
}
