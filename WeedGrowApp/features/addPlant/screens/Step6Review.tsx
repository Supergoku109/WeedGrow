import React from 'react';

import { StepScreen } from '../components/StepScreen';
import { ReviewForm } from '../components/ReviewForm';
import { useStep6Review } from '../hooks/useStep6Review';
import { StepProps } from '../types/StepProps';

export default function Step6Review({ form, setField, next, back, step }: StepProps) {
  const logic = useStep6Review(form);

  return (
    <StepScreen 
      step={step}
      backgroundColor={logic.backgroundColor}
    >
      <ReviewForm form={form} logic={logic} back={back} />
    </StepScreen>
  );
}
