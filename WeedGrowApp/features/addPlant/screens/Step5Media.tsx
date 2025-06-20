import React from 'react';

import { StepScreen } from '../components/StepScreen';
import { MediaForm } from '../components/MediaForm';
import { useStep5Media } from '../hooks/useStep5Media';
import { StepProps } from '../types/StepProps';

export default function Step5Media({ form, setField, next, back, step }: StepProps) {
  const logic = useStep5Media(form, setField);

  return (
    <StepScreen 
      step={step}
      backgroundColor={logic.backgroundColor}
    >
      <MediaForm form={form} logic={logic} next={next} back={back} />
    </StepScreen>
  );
}
