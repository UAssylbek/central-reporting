// frontend/src/shared/hooks/useModalSteps.ts
import { useState, useCallback } from "react";

export interface UseModalStepsReturn {
  currentStep: number;
  totalSteps: number;
  isFirstStep: boolean;
  isLastStep: boolean;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  resetSteps: () => void;
}

export function useModalSteps(total: number, initial: number = 0): UseModalStepsReturn {
  const [currentStep, setCurrentStep] = useState(initial);

  const nextStep = useCallback(() => {
    setCurrentStep((prev) => Math.min(prev + 1, total - 1));
  }, [total]);

  const prevStep = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  }, []);

  const goToStep = useCallback(
    (step: number) => {
      if (step >= 0 && step < total) {
        setCurrentStep(step);
      }
    },
    [total]
  );

  const resetSteps = useCallback(() => {
    setCurrentStep(initial);
  }, [initial]);

  return {
    currentStep,
    totalSteps: total,
    isFirstStep: currentStep === 0,
    isLastStep: currentStep === total - 1,
    nextStep,
    prevStep,
    goToStep,
    resetSteps,
  };
}