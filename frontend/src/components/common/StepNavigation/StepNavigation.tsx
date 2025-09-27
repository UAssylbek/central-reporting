import React from "react";

interface StepNavigationProps {
  currentStep: number;
  totalSteps: number;
  stepLabels: string[];
  onStepClick?: (step: number) => void;
  allowPreviousSteps?: boolean;
}

const StepNavigation: React.FC<StepNavigationProps> = ({
  currentStep,
  totalSteps,
  stepLabels,
  onStepClick,
  allowPreviousSteps = true,
}) => {
  const getStepStatus = (stepIndex: number) => {
    const stepNumber = stepIndex + 1;
    if (stepNumber < currentStep) return "completed";
    if (stepNumber === currentStep) return "current";
    return "pending";
  };

  const handleStepClick = (stepIndex: number) => {
    const stepNumber = stepIndex + 1;

    if (!onStepClick) return;

    // Разрешаем переход только к предыдущим шагам или текущему
    if (allowPreviousSteps && stepNumber <= currentStep) {
      onStepClick(stepNumber);
    }
  };

  return (
    <div className="step-navigation">
      <div className="step-progress">
        <div
          className="step-progress-bar"
          style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
        />
      </div>

      <div className="step-list">
        {stepLabels.map((label, index) => {
          const stepNumber = index + 1;
          const status = getStepStatus(index);
          const isClickable =
            allowPreviousSteps && stepNumber <= currentStep && onStepClick;

          return (
            <div
              key={stepNumber}
              className={`step-item step-${status} ${
                isClickable ? "step-clickable" : ""
              }`}
              onClick={() => handleStepClick(index)}
            >
              <div className="step-number">
                {status === "completed" ? (
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                  >
                    <polyline points="20,6 9,17 4,12"></polyline>
                  </svg>
                ) : (
                  stepNumber
                )}
              </div>
              <div className="step-label">
                <span className="step-title">{label}</span>
                <span className="step-subtitle">
                  {status === "completed" && "Выполнено"}
                  {status === "current" && "Текущий шаг"}
                  {status === "pending" && "Ожидание"}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="step-counter">
        Шаг {currentStep} из {totalSteps}
      </div>
    </div>
  );
};

export default StepNavigation;
