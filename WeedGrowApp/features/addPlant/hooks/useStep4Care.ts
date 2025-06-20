import { useState } from 'react';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import type { PlantForm } from '@/features/plants/form/PlantForm';
import { BaseStepLogic } from '../types/StepLogic';
import { useStepBackground } from './useStepBackground';

export interface Step4CareLogic extends BaseStepLogic {
  tint: string;
  textColor: string;
  waterMenu: boolean;
  setWaterMenu: (val: boolean) => void;
  wateringOptions: string[];
  pestOptions: string[];
  trainingOptions: string[];
  setField: (key: keyof PlantForm, value: any) => void;
  togglePest: (pest: string) => void;
  toggleTraining: (training: string) => void;
}

export function useStep4Care(
  form: PlantForm,
  setField: (key: keyof PlantForm, value: any) => void
): Step4CareLogic {
  const backgroundColor = useStepBackground();
  const scheme = (useColorScheme() ?? 'dark') as keyof typeof Colors;
  const tint = Colors[scheme].tint;
  const textColor = Colors[scheme].text;

  const [waterMenu, setWaterMenu] = useState(false)

  const wateringOptions = ['Every day', 'Every 2 days', 'Every 3 days', 'Weekly']
  const pestOptions = ['Spider Mites', 'Powdery Mildew', 'Aphids']
  const trainingOptions = ['LST', 'Topping', 'SCROG']

  const togglePest = (pest: string) => {
    const current = form.pests || []
    setField('pests', current.includes(pest)
      ? current.filter(p => p !== pest)
      : [...current, pest])
  }

  const toggleTraining = (training: string) => {
    const current = form.trainingTags || []
    setField('trainingTags', current.includes(training)
      ? current.filter(t => t !== training)
      : [...current, training])
  }

  return {
    backgroundColor,
    tint,
    textColor,
    waterMenu,
    setWaterMenu,
    wateringOptions,
    pestOptions,
    trainingOptions,
    setField,
    togglePest,
    toggleTraining
  }
}
