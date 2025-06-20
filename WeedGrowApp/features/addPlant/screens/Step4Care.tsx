import React from 'react';

import { StepScreen } from '../components/StepScreen';
import { CareForm } from '../components/CareForm';
import { useStep4Care } from '../hooks/useStep4Care';
import { StepProps } from '../types/StepProps';

export default function Step4Care({
  form, setField, next, back, step
}: StepProps) {
  const logic = useStep4Care(form, setField);

  return (
    <StepScreen 
      step={step}
      backgroundColor={logic.backgroundColor}
    >
      <CareForm form={form} logic={logic} next={next} back={back} />
    </StepScreen>
  );
}
