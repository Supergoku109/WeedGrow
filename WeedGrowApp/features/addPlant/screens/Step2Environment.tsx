// features/addPlant/screens/Step2Environment.tsx
import React from 'react';
import { ScreenLayout }         from '../components/ScreenLayout';
import { StepIndicatorBar }     from '../components/StepIndicatorBar';
import { EnvironmentForm }      from '../components/EnvironmentForm';
import { useStep2Environment }  from '../hooks/useStep2Environment';
import type { PlantForm } from '@/features/plants/form/PlantForm';

interface StepProps {
  form: PlantForm;
  setField: (k: keyof PlantForm, v: any) => void;
  next(): void;
  back(): void;
  step: number;
}

export default function Step2Environment({ form, setField, next, back, step }: StepProps) {
  const logic = useStep2Environment(form, setField);

  return (
    <ScreenLayout
      backgroundColor={logic.backgroundColor}
      paddingTopIndicator
    >
      <StepIndicatorBar currentPosition={step - 1} />
      <EnvironmentForm logic={logic} next={next} back={back}/>
    </ScreenLayout>
  );
}
