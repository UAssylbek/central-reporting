import { useState, useCallback } from "react";

export interface StepData {
  [key: string]: any;
}

export interface ModalFormData {
  [stepKey: string]: StepData;
}

export interface UseModalStepsReturn {
  currentStep: number;
  formData: ModalFormData;
  isFirstStep: boolean;
  isLastStep: boolean;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  updateStepData: <T extends StepData>(
    stepKey: string,
    data: Partial<T>
  ) => void;
  resetForm: () => void;
  canProceedToNext: boolean;
  setCanProceedToNext: (canProceed: boolean) => void;
}

export const useModalSteps = (
  totalSteps: number,
  initialData?: ModalFormData
): UseModalStepsReturn => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<ModalFormData>(initialData || {});
  const [canProceedToNext, setCanProceedToNext] = useState(true);

  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === totalSteps;

  const nextStep = useCallback(() => {
    if (currentStep < totalSteps && canProceedToNext) {
      setCurrentStep((prev) => prev + 1);
    }
  }, [currentStep, totalSteps, canProceedToNext]);

  const prevStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  const goToStep = useCallback(
    (step: number) => {
      if (step >= 1 && step <= totalSteps) {
        setCurrentStep(step);
      }
    },
    [totalSteps]
  );

  const updateStepData = useCallback(
    <T extends StepData>(stepKey: string, data: Partial<T>) => {
      setFormData((prev) => ({
        ...prev,
        [stepKey]: {
          ...prev[stepKey],
          ...data,
        },
      }));
    },
    []
  );

  const resetForm = useCallback(() => {
    setCurrentStep(1);
    setFormData(initialData || {});
    setCanProceedToNext(true);
  }, [initialData]);

  return {
    currentStep,
    formData,
    isFirstStep,
    isLastStep,
    nextStep,
    prevStep,
    goToStep,
    updateStepData,
    resetForm,
    canProceedToNext,
    setCanProceedToNext,
  };
};
