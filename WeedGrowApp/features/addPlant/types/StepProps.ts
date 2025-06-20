// features/addPlant/types/StepProps.ts
import type { PlantForm } from '@/features/plants/form/PlantForm';

/**
 * Common props shared by all step screens in the plant addition flow
 */
export interface StepProps {
  /** The plant form state */
  form: PlantForm;
  
  /** Function to update a specific field in the form */
  setField: (k: keyof PlantForm, v: any) => void;
  
  /** Navigate to the next step */
  next(): void;
  
  /** Navigate to the previous step */
  back(): void;
  
  /** Current step number (1-based) */
  step: number;
}
