// frontend/src/shared/ui/StepNavigation/StepNavigation.tsx
import { cn } from "../../utils/cn";

export interface StepNavigationProps {
  steps: string[];
  currentStep: number;
  onStepClick?: (step: number) => void;
  allowJump?: boolean;
}

export function StepNavigation({
  steps,
  currentStep,
  onStepClick,
  allowJump = false,
}: StepNavigationProps) {
  const handleStepClick = (index: number) => {
    if (allowJump && onStepClick && index !== currentStep) {
      onStepClick(index);
    }
  };

  return (
    <div className="w-full py-6">
      {/* Progress bar */}
      <div className="relative">
        {/* Background line */}
        <div className="absolute top-5 left-0 w-full h-0.5 bg-gray-200 dark:bg-zinc-700" />
        
        {/* Progress line */}
        <div
          className="absolute top-5 left-0 h-0.5 bg-blue-600 dark:bg-blue-400 transition-all duration-300"
          style={{
            width: `${(currentStep / (steps.length - 1)) * 100}%`,
          }}
        />

        {/* Steps */}
        <div className="relative flex justify-between">
          {steps.map((step, index) => {
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;
            const isClickable = allowJump && onStepClick;

            return (
              <button
                key={index}
                onClick={() => handleStepClick(index)}
                disabled={!isClickable}
                className={cn(
                  "flex flex-col items-center gap-2 group",
                  isClickable && "cursor-pointer",
                  !isClickable && "cursor-default"
                )}
              >
                {/* Circle */}
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-300 border-2",
                    isActive &&
                      "bg-blue-600 dark:bg-blue-500 border-blue-600 dark:border-blue-500 text-white scale-110",
                    isCompleted &&
                      "bg-blue-600 dark:bg-blue-500 border-blue-600 dark:border-blue-500 text-white",
                    !isActive &&
                      !isCompleted &&
                      "bg-white dark:bg-zinc-800 border-gray-300 dark:border-zinc-600 text-gray-500 dark:text-zinc-400",
                    isClickable &&
                      "group-hover:border-blue-400 dark:group-hover:border-blue-500"
                  )}
                >
                  {isCompleted ? (
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </div>

                {/* Label */}
                <span
                  className={cn(
                    "text-xs font-medium text-center max-w-[100px] transition-colors",
                    isActive &&
                      "text-blue-600 dark:text-blue-400",
                    !isActive &&
                      "text-gray-600 dark:text-zinc-400"
                  )}
                >
                  {step}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}