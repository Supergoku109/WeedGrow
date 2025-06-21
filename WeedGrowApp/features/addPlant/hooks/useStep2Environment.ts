// features/addPlant/hooks/useStep2Environment.ts
// This hook manages the logic for the Environment step in the Add Plant flow.
// It handles environment selection, sensor profiles, pot/sunlight options, and dropdown menu state for the environment form step.

import { useState, useEffect, useMemo } from 'react';
import { useLocalSearchParams }        from 'expo-router';
import { useSafeAreaInsets }          from 'react-native-safe-area-context';
import type { PlantForm }             from '@/features/plants/form/PlantForm';
import { BaseStepLogic }              from '../types/StepLogic';
import { useStepBackground }          from './useStepBackground';
import {
  potSizeOptions,
  sunlightOptions,
  fetchSensorProfiles,
} from '../api/environmentApi';

// Interface for the logic returned by this hook
export interface Step2EnvironmentLogic extends BaseStepLogic {
  insetsTop: number;
  environment: PlantForm['environment'];
  setField(key: keyof PlantForm, v: any): void;
  sensorOptions: { label:string; value:string }[];
  loadingProfiles: boolean;
  sensorMenuVisible: boolean;
  openSensorMenu(): void;
  closeSensorMenu(): void;
  potMenuVisible: boolean;
  openPotMenu(): void;
  closePotMenu(): void;
  sunMenuVisible: boolean;
  openSunMenu(): void;
  closeSunMenu(): void;
  plantedIn: PlantForm['plantedIn'];
  potSizeOptions: string[];
  sunlightOptions: typeof sunlightOptions;
}

// Hook for managing the Environment step logic
export function useStep2Environment(
  form: PlantForm,
  setField: (k: keyof PlantForm, v:any) => void
): Step2EnvironmentLogic {
  // Theming & safe area insets
  const backgroundColor = useStepBackground();
  const { top: insetsTop } = useSafeAreaInsets();

  // Dropdown menu state
  const [sensorMenuVisible, setSensorMenuVisible] = useState(false);
  const [potMenuVisible,    setPotMenuVisible]    = useState(false);
  const [sunMenuVisible,    setSunMenuVisible]    = useState(false);

  // Sensor profiles for indoor/greenhouse
  const [sensorProfiles, setSensorProfiles] = useState<{ id:string; name:string }[]>([]);
  const [loadingProfiles, setLoadingProfiles] = useState(false);

  // Load sensor profiles when environment changes
  useEffect(() => {
    if (form.environment === 'indoor' || form.environment === 'greenhouse') {
      setLoadingProfiles(true);
      fetchSensorProfiles()
        .then(profiles => setSensorProfiles(profiles))
        .finally(() => setLoadingProfiles(false));
    }
  }, [form.environment]);

  // Handle deep-link to new sensor profile
  const params = useLocalSearchParams();
  useEffect(() => {
    if (params.newSensorProfileId && params.newSensorProfileId !== form.sensorProfileId) {
      setField('sensorProfileId', params.newSensorProfileId);
    }
  }, [params.newSensorProfileId]);

  // Build dropdown options for sensor profiles
  const sensorOptions = useMemo(() => 
    sensorProfiles.map(p => ({ label: p.name, value: p.id })),
    [sensorProfiles]
  );

  // Return logic and state for the step
  return {
    backgroundColor,
    insetsTop,
    environment: form.environment,
    plantedIn:  form.plantedIn,
    setField,
    loadingProfiles,
    sensorMenuVisible,
    openSensorMenu:  () => setSensorMenuVisible(true),
    closeSensorMenu: () => setSensorMenuVisible(false),
    sensorOptions,
    potMenuVisible,
    openPotMenu:  () => setPotMenuVisible(true),
    closePotMenu: () => setPotMenuVisible(false),
    sunMenuVisible,
    openSunMenu:  () => setSunMenuVisible(true),
    closeSunMenu: () => setSunMenuVisible(false),
    potSizeOptions,
    sunlightOptions,
  };
}
