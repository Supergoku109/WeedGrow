import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenLayout } from '../components/ScreenLayout';
import { StepIndicatorBar } from '../components/StepIndicatorBar';
import { ReviewForm } from '../components/ReviewForm';
import { useStep6Review } from '../hooks/useStep6Review';
import type { PlantForm } from '@/features/plants/form/PlantForm';
import HomeBackground from '@/features/groups/components/HomeBackground';

interface StepProps {
  form: PlantForm;
  setField: (k: keyof PlantForm, v: any) => void;
  next(): void;
  back(): void;
  step: number;
}

export default function Step6Review({ form, setField, next, back, step }: StepProps) {
  const logic = useStep6Review(form);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: logic.backgroundColor }}>
      <HomeBackground />
      <StepIndicatorBar currentPosition={step - 1} />
      <ScreenLayout backgroundColor={logic.backgroundColor}>
        <ReviewForm form={form} logic={logic} back={back} />
      </ScreenLayout>
    </SafeAreaView>
  );
}
