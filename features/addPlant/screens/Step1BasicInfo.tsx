// features/addPlant/screens/Step1BasicInfo.tsx
// This screen renders the first step of the Add Plant flow: entering basic plant information.
// It uses the BasicInfoForm and step logic, and handles navigation between steps.

import React, { memo } from 'react';

import { StepScreen } from '@/features/addPlant/components/StepScreen';
import { BasicInfoForm } from '@/features/addPlant/components/BasicInfoForm';
import { useStep1BasicInfo } from '@/features/addPlant/hooks/useStep1BasicInfo';
import { StepProps } from '@/features/addPlant/types/StepProps';

const Step1BasicInfo = memo(function Step1BasicInfo({
  form, setField, next, back, step
}: StepProps) {
  // Get logic for this step
  const logic = useStep1BasicInfo(form, setField);
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
