import { useState } from 'react';
import type { PlantForm } from '@/features/plants/form/PlantForm';

export function useAddPlantForm() {
  const [form, setForm] = useState<PlantForm>({
    name: '',
    strain: '',
    growthStage: 'germination',
    ageDays: '0',
    environment: 'outdoor',
    plantedIn: 'pot',
    potSize: '',
    sunlightExposure: '',
    sensorProfileId: '',
    location: undefined,
    locationNickname: '',
    wateringFrequency: '',
    fertilizer: '',
    pests: [],
    trainingTags: [],
    notes: '',
    imageUri: '',
  });
  const setField = (field: keyof PlantForm, value: any) => {
    setForm((prev: PlantForm) => ({ ...prev, [field]: value }));
  };

  return { form, setField };
}
