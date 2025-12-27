import { useState, useCallback, useMemo, createContext } from "react";
import { FormStepsContextType, DataCreateUser } from "../../types";
import { steps } from "../../components";

export const FormStepsContext = createContext<FormStepsContextType | undefined>(
  undefined
);

export const FormStepsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [createUserData, setCreateUserData] = useState<DataCreateUser>(
    {} as DataCreateUser
  );
  const [currentStep, setCurrentStep] = useState(0);

  const updateFormData = useCallback(
    (data: Partial<DataCreateUser>) => {
      setCreateUserData((prevData: any) => ({ ...prevData, ...data }));
    },
    []
  );

  const goToNextStep = useCallback(() => {
    if (currentStep > steps.length) {
      return;
    }

    setCurrentStep((prevState) => prevState + 1);
  }, [currentStep]);

  const goToPreviousStep = useCallback(() => {
    if (currentStep === 0) {
      return;
    }

    setCurrentStep((prevState) => prevState - 1);
  }, [currentStep]);

  const resetFormSteps = useCallback(() => {
    setCreateUserData({} as DataCreateUser);
    setCurrentStep(0);
  }, []);

  const value = useMemo(
    () => ({
      data: createUserData,
      currentStep,
      updateFormData,
      goToNextStep,
      goToPreviousStep,
      resetFormSteps,
    }),
    [
      createUserData,
      currentStep,
      updateFormData,
      goToNextStep,
      goToPreviousStep,
      resetFormSteps,
    ]
  );

  return (
    <FormStepsContext.Provider value={value}>
      {children}
    </FormStepsContext.Provider>
  );
};
