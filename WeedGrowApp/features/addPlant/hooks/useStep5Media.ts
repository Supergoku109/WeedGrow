import { useState } from 'react';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import type { PlantForm } from '@/features/plants/form/PlantForm';
import * as ImagePicker from 'expo-image-picker';
import { BaseStepLogic } from '../types/StepLogic';
import { useStepBackground } from './useStepBackground';

export interface Step5MediaLogic extends BaseStepLogic {
  tint: string;
  snackVisible: boolean;
  setSnackVisible(val: boolean): void;
  pickImage(fromCamera: boolean): Promise<void>;
  setField(key: keyof PlantForm, value: any): void;
}

export function useStep5Media(
  form: PlantForm,
  setField: (key: keyof PlantForm, value: any) => void
): Step5MediaLogic {
  const backgroundColor = useStepBackground();
  const scheme = (useColorScheme() ?? 'dark') as keyof typeof Colors;
  const tint = Colors[scheme].tint;

  const [snackVisible, setSnackVisible] = useState(false)

  const pickImage = async (fromCamera: boolean) => {
    const result = fromCamera
      ? await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images })
      : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images })

    if (!result.canceled) {
      setField('imageUri', result.assets[0].uri)
      setSnackVisible(true)
    }
  }

  return {
    backgroundColor,
    tint,
    snackVisible,
    setSnackVisible,
    pickImage,
    setField
  }
}
