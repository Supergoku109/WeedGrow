import React from 'react';

import { StepScreen } from '../components/StepScreen';
import { EnvironmentForm } from '../components/EnvironmentForm';
import { useStep2Environment } from '../hooks/useStep2Environment';
import { StepProps } from '../types/StepProps';

export default function Step2Environment({ form, setField, next, back, step }: StepProps) {
  const logic = useStep2Environment(form, setField);

  return (
    <StepScreen 
      step={step}
      backgroundColor={logic.backgroundColor}
    >
      <EnvironmentForm form={form} logic={logic} next={next} back={back} />
    </StepScreen>
  );
}
