// Step5Media.tsx
// This screen renders the Media step of the Add Plant flow: adding a photo and notes.
// It uses the MediaForm and step logic, and handles navigation between steps.

import React from 'react';

import { StepScreen } from '../components/StepScreen';
import { MediaForm } from '../components/MediaForm';
import { useStep5Media } from '../hooks/useStep5Media';
import { StepProps } from '../types/StepProps';

export default function Step5Media({ form, setField, next, back, step }: StepProps) {
  // Get logic for this step
  const logic = useStep5Media(form, setField);

  // Render the step screen and form
  return (
    <StepScreen 
      step={step}
      backgroundColor={logic.backgroundColor}
    >
      <MediaForm form={form} logic={logic} next={next} back={back} />
    </StepScreen>
  );
}
