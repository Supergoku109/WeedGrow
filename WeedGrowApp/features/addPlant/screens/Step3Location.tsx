import React from 'react';

import { StepScreen } from '../components/StepScreen';
import { LocationForm } from '../components/LocationForm';
import { useStep3Location } from '../hooks/useStep3Location';
import { StepProps } from '../types/StepProps';

export default function Step3Location({ form, setField, next, back, step }: StepProps) {
  const logic = useStep3Location(form, setField);

  return (
    <StepScreen 
      step={step}
      backgroundColor={logic.backgroundColor}
    >
      <LocationForm form={form} logic={logic} next={next} back={back} />
    </StepScreen>
  );
}
