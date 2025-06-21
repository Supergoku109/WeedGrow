// features/addPlant/hooks/useStep2Environment.ts

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

export interface Step2EnvironmentLogic extends BaseStepLogic {
  insetsTop: number;

  // environment radios:
  environment: PlantForm['environment'];
  setField(key: keyof PlantForm, v: any): void;

  // sensor menu state & options:
  sensorOptions: { label:string; value:string }[];
  loadingProfiles: boolean;
  sensorMenuVisible: boolean;
  openSensorMenu(): void;
  closeSensorMenu(): void;

  // pot menu:
  potMenuVisible: boolean;
  openPotMenu(): void;
  closePotMenu(): void;

  // sun menu:
  sunMenuVisible: boolean;
  openSunMenu(): void;
  closeSunMenu(): void;

  // plantedIn button group:
  plantedIn: PlantForm['plantedIn'];

  // raw options lists for dropdowns:
  potSizeOptions: string[];
  sunlightOptions: typeof sunlightOptions;
}

export function useStep2Environment(
  form: PlantForm,
  setField: (k: keyof PlantForm, v:any) => void
): Step2EnvironmentLogic {
  // theming & insets
  const backgroundColor = useStepBackground();
  const { top: insetsTop } = useSafeAreaInsets();

  // menus
  const [sensorMenuVisible, setSensorMenuVisible] = useState(false);
  const [potMenuVisible,    setPotMenuVisible]    = useState(false);
  const [sunMenuVisible,    setSunMenuVisible]    = useState(false);

  // sensor profiles
  const [sensorProfiles, setSensorProfiles] = useState<{ id:string; name:string }[]>([]);
  const [loadingProfiles, setLoadingProfiles] = useState(false);

  // load when indoor/greenhouse
  useEffect(() => {
    if (form.environment === 'indoor' || form.environment === 'greenhouse') {
      setLoadingProfiles(true);
      fetchSensorProfiles()
        .then(profiles => setSensorProfiles(profiles))
        .finally(() => setLoadingProfiles(false));
    }
  }, [form.environment]);

  // handle deep-link newSensorProfileId
  const params = useLocalSearchParams();
  useEffect(() => {
    if (params.newSensorProfileId && params.newSensorProfileId !== form.sensorProfileId) {
      setField('sensorProfileId', params.newSensorProfileId);
    }
  }, [params.newSensorProfileId]);

  // build dropdown options
  const sensorOptions = useMemo(() => 
    sensorProfiles.map(p => ({ label: p.name, value: p.id })),
    [sensorProfiles]
  ,);

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
