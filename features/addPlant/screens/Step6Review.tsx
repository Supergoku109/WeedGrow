// Step6Review.tsx
// This screen renders the Review step of the Add Plant flow: reviewing and saving the plant.
// It uses the ReviewForm and step logic, and handles navigation between steps.

import React from 'react';

import { StepScreen } from '../components/StepScreen';
import { ReviewForm } from '../components/ReviewForm';
import { useStep6Review } from '../hooks/useStep6Review';
import { StepProps } from '../types/StepProps';

export default function Step6Review({ form, setField, next, back, step }: StepProps) {
  // Get logic for this step
  const logic = useStep6Review(form);

  // Render the step screen and form
  return (
    <StepScreen 
      step={step}
      backgroundColor={logic.backgroundColor}
    >
      <ReviewForm form={form} logic={logic} back={back} />
    </StepScreen>
  );
}
