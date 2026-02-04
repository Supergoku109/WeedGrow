// Step3Location.tsx
// This screen renders the Location step of the Add Plant flow: setting the plant's physical location.
// It uses the LocationForm and step logic, and handles navigation between steps.

import React, { memo } from 'react';

import { StepScreen } from '../components/StepScreen';
import { LocationForm } from '../components/LocationForm';
import { useStep3Location } from '../hooks/useStep3Location';
import { StepProps } from '../types/StepProps';

const Step3Location = memo(function Step3Location({ form, setField, next, back, step }: StepProps) {
  // Get logic for this step
  const logic = useStep3Location(form, setField);

  // Render the step screen and form
  return (
    <StepScreen 
      step={step}
      backgroundColor={logic.backgroundColor}
    >
      <LocationForm form={form} logic={logic} next={next} back={back} />
    </StepScreen>
  );
});

export default Step3Location;
