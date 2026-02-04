// features/plants/form/PlantForm.ts

export interface Location {
  lat: number;
  lng: number;
}

export interface PlantForm {
  name: string;
  strain: string;
  growthStage: string;
  ageDays: string;
  environment: string;
  plantedIn: string;
  potSize?: string;
  sunlightExposure?: string;
  wateringFrequency?: string;
  fertilizer?: string;
  pests?: string[];
  trainingTags?: string[];
  notes?: string;
  imageUri?: string;
  location?: Location | null;
  locationNickname?: string;
  sensorProfileId?: string | null;
  soilType?: string;
  soilPh?: string;
  permanentProtection?: string;
  companionPlants?: string[];
  environmentNotes?: string;
}
