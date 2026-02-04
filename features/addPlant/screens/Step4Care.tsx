// Step4Care.tsx
// This screen renders the Care step of the Add Plant flow: entering watering, pest, and training details.
// It uses the CareForm and step logic, and handles navigation between steps.

import React from 'react';

import { StepScreen } from '../components/StepScreen';
import { CareForm } from '../components/CareForm';
import { useStep4Care } from '../hooks/useStep4Care';
import { StepProps } from '../types/StepProps';

export default function Step4Care({
  form, setField, next, back, step
}: StepProps) {
  // Get logic for this step
  const logic = useStep4Care(form, setField);

  // Render the step screen and form
  return (
    <StepScreen 
      step={step}
      backgroundColor={logic.backgroundColor}
    >
      <CareForm form={form} logic={logic} next={next} back={back} />
    </StepScreen>
  );
}
