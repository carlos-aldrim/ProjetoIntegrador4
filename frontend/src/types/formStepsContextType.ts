import { DataCreateUser } from "./dataCreateUser";

export interface FormStepsContextType {
  data: DataCreateUser;
  currentStep: number;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  updateFormData: (data: Partial<DataCreateUser>) => void;

  resetFormSteps: () => void;
}
