// Step2Environment.tsx
// This screen renders the Environment step of the Add Plant flow: selecting environment, sensor profile, pot, and sunlight options.
// It uses the EnvironmentForm and step logic, and handles navigation between steps.

import React, { memo } from 'react';

import { StepScreen } from '../components/StepScreen';
import { EnvironmentForm } from '../components/EnvironmentForm';
import { useStep2Environment } from '../hooks/useStep2Environment';
import { StepProps } from '../types/StepProps';

const Step2Environment = memo(function Step2Environment({ form, setField, next, back, step }: StepProps) {
  // Get logic for this step
  const logic = useStep2Environment(form, setField);

  // Render the step screen and form
  return (
    <StepScreen 
      step={step}
      backgroundColor={logic.backgroundColor}
    >
      <EnvironmentForm form={form} logic={logic} next={next} back={back} />
    </StepScreen>
  );
});

export default Step2Environment;
