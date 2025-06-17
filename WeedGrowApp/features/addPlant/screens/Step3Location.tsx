import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenLayout } from '../components/ScreenLayout';
import { StepIndicatorBar } from '../components/StepIndicatorBar';
import { LocationForm } from '../components/LocationForm';
import { useStep3Location } from '../hooks/useStep3Location';
import type { PlantForm } from '@/features/plants/form/PlantForm';
import HomeBackground from '@/features/groups/components/HomeBackground';

interface StepProps {
  form: PlantForm;
  setField: (k: keyof PlantForm, v: any) => void;
  next(): void;
  back(): void;
  step: number;
}

export default function Step3Location({ form, setField, next, back, step }: StepProps) {
  const logic = useStep3Location(form, setField);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: logic.backgroundColor }}>
      <HomeBackground />
      <StepIndicatorBar currentPosition={step - 1} />
      <ScreenLayout backgroundColor={logic.backgroundColor}>
        <LocationForm form={form} logic={logic} next={next} back={back} />
      </ScreenLayout>
    </SafeAreaView>
  );
}
