// useStep6Review.ts
// This hook manages the logic for the Review step in the Add Plant flow.
// It handles saving the plant to Firestore and navigation after save.

import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { savePlantToFirestore } from '../api/savePlant';
import type { PlantForm } from '@/features/plants/form/PlantForm';
import { BaseStepLogic } from '../types/StepLogic';
import { useStepBackground } from './useStepBackground';

// Interface for the logic returned by this hook
export interface Step6ReviewLogic extends BaseStepLogic {
  tint: string;
  saving: boolean;
  handleSave(): void;
}

// Hook for managing the Review step logic
export function useStep6Review(form: PlantForm): Step6ReviewLogic {
  // Get background color and theme tint
  const backgroundColor = useStepBackground();
  const scheme = (useColorScheme() ?? 'dark') as keyof typeof Colors;
  const tint = Colors[scheme].tint;

  const router = useRouter()
  const [saving, setSaving] = useState(false)

  // Save plant to Firestore and navigate home
  const handleSave = async () => {
    if (saving) return
    setSaving(true)
    try {
      await savePlantToFirestore(form)
      router.replace('/')
    } catch (e) {
      console.error('Error saving plant:', e)
    } finally {
      setSaving(false)
    }
  }

  // Return logic and state for the step
  return {
    backgroundColor,
    tint,
    saving,
    handleSave
  }
}
