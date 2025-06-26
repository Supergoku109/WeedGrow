// features/addPlant/screens/Step1BasicInfo.tsx
// This screen renders the first step of the Add Plant flow: entering basic plant information.
// It uses the BasicInfoForm and step logic, and handles navigation between steps.

import React, { memo, useCallback } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';

import { StepScreen } from '@/features/addPlant/components/StepScreen';
import { BasicInfoForm } from '@/features/addPlant/components/BasicInfoForm';
import { useStep1BasicInfo } from '@/features/addPlant/hooks/useStep1BasicInfo';
import { StepProps } from '@/features/addPlant/types/StepProps';

const Step1BasicInfo = memo(function Step1BasicInfo({
  form, setField, next, back, step
}: StepProps) {
  // Get logic for this step
  const logic = useStep1BasicInfo(form, setField);
  const router = useRouter();
  const { tabIndex } = useLocalSearchParams<{ tabIndex: string }>();

  // Navigation helper (not used in this step, but kept for future-proofing)
  const navigateToHome = useCallback(() => {
    router.replace({ pathname: '/(tabs)', params: { tabIndex: tabIndex ?? '1' } });
  }, [router, tabIndex]);

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
        back={back}
      />
    </StepScreen>
  );
});

export default Step1BasicInfo;
