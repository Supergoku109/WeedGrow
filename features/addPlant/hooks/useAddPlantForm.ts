import { useState } from 'react';
import type { PlantForm } from '@/features/plants/form/PlantForm';

const initialForm: PlantForm = {
  name: '',
  strain: '', // set to empty string by default
  growthStage: 'germination',
  ageDays: '', // changed from '0' to ''
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
};

export function useAddPlantForm() {
  const [form, setForm] = useState<PlantForm>(initialForm);
  const setField = (field: keyof PlantForm, value: any) => {
    setForm((prev: PlantForm) => ({ ...prev, [field]: value }));
  };
  const resetForm = () => setForm(initialForm);
  return { form, setField, resetForm };
}
