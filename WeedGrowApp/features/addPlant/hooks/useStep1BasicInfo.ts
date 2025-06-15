// features/addPlant/hooks/useStep1BasicInfo.ts

import { useState, useMemo } from 'react';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { getAvailableStrains } from '../api/basicInfoApi';
import type { PlantForm } from '@/features/plants/form/PlantForm';

export interface Step1BasicInfoLogic {
  backgroundColor: string;
  strainMenuVisible: boolean;
  openStrainMenu(): void;
  closeStrainMenu(): void;
  strainSearch: string;
  setStrainSearch(value: string): void;
  filteredStrains: string[];
  isValid: boolean;
  setField(key: keyof PlantForm, value: any): void;
}

export function useStep1BasicInfo(
  form: PlantForm,
  setField: (key: keyof PlantForm, value: any) => void
): Step1BasicInfoLogic {
  const scheme = (useColorScheme() ?? 'dark') as 'light' | 'dark';
  const backgroundColor = Colors[scheme].background;

  const strains = getAvailableStrains();
  const [strainMenuVisible, setStrainMenuVisible] = useState(false);
  const [strainSearch, setStrainSearch] = useState('');

  const filteredStrains = useMemo(
    () => strains.filter(s => s.toLowerCase().includes(strainSearch.toLowerCase())),
    [strains, strainSearch]
  );

  const isValid = useMemo(() => {
    const nameOk = form.name.trim().length > 0;
    const needAge = form.growthStage === 'vegetative' || form.growthStage === 'flowering';
    const ageOk = needAge ? form.ageDays.trim().length > 0 : true;
    return nameOk && ageOk;
  }, [form.name, form.growthStage, form.ageDays]);

  const openStrainMenu = () => setStrainMenuVisible(true);
  const closeStrainMenu = () => {
    setStrainMenuVisible(false);
    setStrainSearch('');
  };

  return {
    backgroundColor,
    strainMenuVisible,
    openStrainMenu,
    closeStrainMenu,
    strainSearch,
    setStrainSearch,
    filteredStrains,
    isValid,
    setField
  };
}
