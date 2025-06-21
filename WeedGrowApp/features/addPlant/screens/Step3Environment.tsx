import React from 'react';

import { StepScreen } from '../components/StepScreen';
import { EnvironmentForm } from '../components/EnvironmentForm';
import { useStep3Environment } from '../hooks/useStep3Environment';
import { StepProps } from '../types/StepProps';

export default function Step3Environment({ form, setField, next, back, step }: StepProps) {
  const logic = useStep3Environment(form, setField);

  return (
    <StepScreen 
      step={step}
      backgroundColor={logic.backgroundColor}
    >
      <EnvironmentForm form={form} logic={logic} next={next} back={back} />
    </StepScreen>
  );
}
