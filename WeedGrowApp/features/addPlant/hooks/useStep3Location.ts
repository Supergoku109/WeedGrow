import { useState, useMemo, useRef } from 'react';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import type { PlantForm } from '@/features/plants/form/PlantForm';
import * as Location from 'expo-location';
import { Alert } from 'react-native';
import type MapView from 'react-native-maps';
import { BaseStepLogic } from '../types/StepLogic';
import { useStepBackground } from './useStepBackground';

export interface Step3LocationLogic extends BaseStepLogic {
  tint: string;
  loading: boolean;
  isValid: boolean;
  getLocation(): Promise<void>;
  setField(key: keyof PlantForm, value: any): void;
}

export function useStep3Location(  form: PlantForm,
  setField: (key: keyof PlantForm, value: any) => void
): Step3LocationLogic {
  const backgroundColor = useStepBackground();
  const scheme = (useColorScheme() ?? 'dark') as keyof typeof Colors;
  const tint = Colors[scheme].tint;

  const [loading, setLoading] = useState(false)

  const isValid = useMemo(() => {
    return !!form.location
  }, [form.location])

  const getLocation = async () => {
    try {
      setLoading(true)
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required.')
        return
      }

      const lastKnown = await Location.getLastKnownPositionAsync()
      const coords = lastKnown?.coords
        ? lastKnown.coords
        : (await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced })).coords

      setField('location', { lat: coords.latitude, lng: coords.longitude })
    } catch (error) {
      console.error('Location error:', error)
    } finally {
      setLoading(false)
    }
  }

  return {
    backgroundColor,
    tint,
    loading,
    isValid,
    getLocation,
    setField
  }
}
