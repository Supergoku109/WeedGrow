import { create } from 'zustand';

export type GrowthStage = 'germination' | 'seedling' | 'vegetative' | 'flowering';
export type Environment = 'outdoor' | 'greenhouse' | 'indoor';
export type PlantedIn = 'pot' | 'ground';

export interface PlantFormState {
  name: string;
  strain: string;
  growthStage: GrowthStage;
  environment: Environment;
  potSize?: string;
  sunlightExposure?: string;
  plantedIn: PlantedIn;
  location?: { lat: number; lng: number };
  locationNickname?: string;
  wateringFrequency?: string;
  fertilizer?: string;
  pests?: string[];
  trainingTags?: string[];
  notes?: string;
  imageUri?: string;
  setField: (key: keyof Omit<PlantFormState, 'setField' | 'reset'>, value: any) => void;
  reset: () => void;
}

const initialState: Omit<PlantFormState, 'setField' | 'reset'> = {
  name: '',
  strain: '',
  growthStage: 'germination',
  environment: 'outdoor',
  plantedIn: 'pot',
};

export const usePlantForm = create<PlantFormState>((set) => ({
  ...initialState,
  setField: (key, value) => set({ [key]: value }),
  reset: () => set(initialState),
}));
