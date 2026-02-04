// features/addPlant/types/StepLogic.ts

/**
 * Common base interface for all step logic hooks
 */
export interface BaseStepLogic {
  /**
   * Background color for the step screen
   */
  backgroundColor: string;

  /**
   * Whether the form data in this step is valid
   */
  isValid?: boolean;
}
