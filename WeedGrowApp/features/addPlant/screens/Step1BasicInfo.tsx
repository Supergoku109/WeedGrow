// features/addPlant/screens/Step1BasicInfo.tsx
import React from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';

import { StepScreen } from '../components/StepScreen';
import { BasicInfoForm } from '../components/BasicInfoForm';
import { useStep1BasicInfo } from '../hooks/useStep1BasicInfo';
import { StepProps } from '../types/StepProps';

export default function Step1BasicInfo({
  form, setField, next, back, step
}: StepProps) {
  const logic = useStep1BasicInfo(form, setField);
  const router = useRouter();
  const { tabIndex } = useLocalSearchParams<{ tabIndex: string }>();
  const navigateToHome = () => {
    // Navigate back to the home screen with the correct tab index
    if (tabIndex) {
      router.replace({ pathname: '/(tabs)', params: { tabIndex } });
    } else {
      // If no tabIndex is provided, default to the plants tab (index 1)
      router.replace({ pathname: '/(tabs)', params: { tabIndex: '1' } });
    }
  };

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
        back={navigateToHome}
      />
    </StepScreen>
  );
}
