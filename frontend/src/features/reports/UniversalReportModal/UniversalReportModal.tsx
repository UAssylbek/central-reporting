// frontend/src/features/reports/UniversalReportModal/UniversalReportModal.tsx
import { useEffect, useState } from "react";
import { Modal } from "../../../shared/ui/Modal/Modal";
import { Button } from "../../../shared/ui/Button/Button";
import { StepNavigation } from "../../../shared/ui/StepNavigation/StepNavigation";
import { ConfirmModal } from "../../../shared/ui/ConfirmModal/ConfirmModal";
import { useModalSteps } from "../../../shared/hooks/useModalSteps";
import { useReportForm } from "../../../shared/hooks/useReportForm";
import { OrganizationStep } from "../steps/OrganizationStep";
import { ReportParamsStep } from "../steps/ReportParamsStep";
import { EmailStep } from "../steps/EmailStep";
import { ConfirmationStep } from "../steps/ConfirmationStep";
import { ReportSelectionStep } from "../steps/ReportSelectionStep";
import type { ReportType } from "../../../shared/types/reports";
import type { ReportModalConfig } from "../../../shared/types/reportConfig";

export interface UniversalReportModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly reportType: ReportType;
  readonly config: ReportModalConfig;
  readonly onSubmit?: (formData: Record<string, unknown>) => Promise<void>;
  readonly startStep?: number;
  readonly allowReportChange?: boolean;
}

export function UniversalReportModal({
  isOpen,
  onClose,
  reportType: initialReportType,
  config: initialConfig,
  onSubmit,
  startStep = 1,
  allowReportChange = false,
}: UniversalReportModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [slideDirection, setSlideDirection] = useState<"left" | "right" | null>(
    null
  );

  // Локальное состояние для динамической смены отчёта
  const [currentReportType, setCurrentReportType] = useState(initialReportType);
  const [currentConfig, setCurrentConfig] = useState(initialConfig);

  // 5 СТРАНИЦ: Выбор отчета + Организации + Параметры + Email + Подтверждение
  const totalSteps = 1 + 1 + currentConfig.steps.length + 1 + 1;

  const {
    currentStep,
    isFirstStep,
    isLastStep,
    nextStep,
    prevStep,
    resetSteps,
    goToStep,
  } = useModalSteps(totalSteps);

  const { formData, updateField, resetForm, errors, setErrors } =
    useReportForm(currentReportType);

  // Названия шагов для навигации
  const stepLabels = [
    "Выбор отчета",
    "Организации",
    ...currentConfig.steps.map((s) => s.title),
    "Email уведомления",
    "Подтверждение",
  ];

  // Индексы шагов для удобства
  const STEP_REPORT_SELECTION = 0;
  const STEP_ORGANIZATIONS = 1;
  const STEP_PARAMS_START = 2;
  const STEP_PARAMS_END = 1 + currentConfig.steps.length;
  const STEP_EMAIL = STEP_PARAMS_END + 1;
  const STEP_CONFIRMATION = STEP_EMAIL + 1;

  // Сброс и установка стартового шага при открытии/закрытии
  useEffect(() => {
    if (isOpen) {
      setCurrentReportType(initialReportType);
      setCurrentConfig(initialConfig);
      resetForm(initialReportType);
      resetSteps();
      setShowSuccessNotification(false);
      setSlideDirection(null);

      if (startStep > 0 && startStep < totalSteps) {
        goToStep(startStep);
      }
    }
  }, [
    isOpen,
    initialReportType,
    initialConfig,
    resetForm,
    resetSteps,
    startStep,
    goToStep,
    totalSteps,
  ]);

  // Блокировка скролла body при открытии модалки
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Обработчик смены отчёта на первой странице
  const handleReportChange = (newReportType: ReportType) => {
    import("../configs").then(({ getReportConfig }) => {
      const newConfig = getReportConfig(newReportType);
      if (newConfig) {
        setCurrentReportType(newReportType);
        setCurrentConfig(newConfig);
        resetForm(newReportType);
      }
    });
  };

  const validateCurrentStep = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (currentStep === STEP_REPORT_SELECTION) {
      return true;
    }

    if (currentStep === STEP_ORGANIZATIONS) {
      if (formData.organizationIds.length === 0) {
        newErrors.organizations = "Выберите хотя бы одну организацию";
        setErrors(newErrors);
        return false;
      }
    }

    if (currentStep >= STEP_PARAMS_START && currentStep <= STEP_PARAMS_END) {
      const stepIndex = currentStep - STEP_PARAMS_START;
      const stepConfig = currentConfig.steps[stepIndex];

      stepConfig.fields.forEach((field) => {
        const value = formData[field.name];

        if (field.required && !value) {
          newErrors[
            field.name
          ] = `Поле "${field.label}" обязательно для заполнения`;
        }

        if (value && field.validation) {
          const validationResult = field.validation(value, formData);
          if (validationResult !== true) {
            newErrors[field.name] =
              typeof validationResult === "string"
                ? validationResult
                : `Поле "${field.label}" заполнено некорректно`;
          }
        }
      });
    }

    if (currentStep === STEP_EMAIL) {
      if (formData.emailNotification && formData.recipients.length === 0) {
        newErrors.recipients = "Добавьте хотя бы один email адрес";
      }
    }

    if (currentStep === STEP_CONFIRMATION) {
      return true;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setSlideDirection("left");
      setTimeout(() => {
        nextStep();
        setSlideDirection(null);
      }, 150);
    }
  };

  const handlePrev = () => {
    setSlideDirection("right");
    setTimeout(() => {
      prevStep();
      setSlideDirection(null);
    }, 150);
  };

  const handleSubmit = async () => {
    if (!validateCurrentStep()) {
      return;
    }

    try {
      setIsSubmitting(true);

      if (onSubmit) {
        await onSubmit(formData);
      } else {
        console.log("Submitting report:", formData);
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      setShowSuccessNotification(true);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Ошибка при создании запроса";
      setErrors({ submit: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseAttempt = () => {
    if (currentStep > STEP_REPORT_SELECTION) {
      setShowCloseConfirm(true);
    } else {
      onClose();
    }
  };

  const handleConfirmClose = () => {
    setShowCloseConfirm(false);
    onClose();
  };

  const handleSuccessClose = () => {
    setShowSuccessNotification(false);
    onClose();
  };

  // Клавиатурная навигация
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Если открыто подтверждение закрытия
      if (showCloseConfirm) {
        if (e.key === "Enter") {
          e.preventDefault();
          handleConfirmClose();
        }
        if (e.key === "Escape") {
          e.preventDefault();
          setShowCloseConfirm(false);
        }
        return;
      }

      // Если показано уведомление об успехе
      if (showSuccessNotification) {
        if (e.key === "Enter" || e.key === "Escape") {
          e.preventDefault();
          handleSuccessClose();
        }
        return;
      }

      // Основная навигация
      if (e.key === "Enter" && !isSubmitting) {
        e.preventDefault();

        if (isLastStep) {
          handleSubmit();
        } else if (validateCurrentStep()) {
          handleNext();
        }
      }

      if (e.key === "Escape" && !isSubmitting) {
        e.preventDefault();
        handleCloseAttempt();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [
    isOpen,
    currentStep,
    isLastStep,
    isSubmitting,
    showCloseConfirm,
    showSuccessNotification,
    formData,
  ]);

  const renderCurrentStep = () => {
    const baseClass = "transition-all duration-300";
    const slideClass =
      slideDirection === "left"
        ? "-translate-x-full opacity-0"
        : slideDirection === "right"
        ? "translate-x-full opacity-0"
        : "translate-x-0 opacity-100";

    const content = (() => {
      if (currentStep === STEP_REPORT_SELECTION) {
        return (
          <ReportSelectionStep
            selectedReport={currentReportType}
            onChange={allowReportChange ? handleReportChange : () => {}}
          />
        );
      }

      if (currentStep === STEP_ORGANIZATIONS) {
        return (
          <OrganizationStep
            selectedOrganizations={formData.organizationIds}
            onChange={(orgs) => updateField("organizationIds", orgs)}
          />
        );
      }

      if (currentStep >= STEP_PARAMS_START && currentStep <= STEP_PARAMS_END) {
        const stepIndex = currentStep - STEP_PARAMS_START;
        const stepConfig = currentConfig.steps[stepIndex];
        return (
          <ReportParamsStep
            step={stepConfig}
            formData={formData}
            onChange={updateField}
            errors={errors}
          />
        );
      }

      if (currentStep === STEP_EMAIL) {
        return (
          <EmailStep
            emailNotification={formData.emailNotification}
            recipients={formData.recipients}
            onChange={updateField}
          />
        );
      }

      if (currentStep === STEP_CONFIRMATION) {
        return (
          <ConfirmationStep
            reportTitle={currentConfig.title}
            config={currentConfig}
            formData={formData}
            organizationCount={formData.organizationIds.length}
          />
        );
      }

      return null;
    })();

    return <div className={`${baseClass} ${slideClass}`}>{content}</div>;
  };

  return (
    <>
      <Modal
        isOpen={isOpen && !showSuccessNotification}
        onClose={handleCloseAttempt}
        title={currentConfig.title}
        size="xl"
        closeOnOverlayClick={false}
      >
        <div className="space-y-6">
          <StepNavigation
            steps={stepLabels}
            currentStep={currentStep}
            allowJump={false}
          />

          <div className="min-h-[400px] overflow-hidden">
            {renderCurrentStep()}
          </div>

          {errors.submit && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-800 dark:text-red-200 text-sm">
                {errors.submit}
              </p>
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-zinc-700">
            <div>
              {!isFirstStep && (
                <Button
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={handlePrev}
                  disabled={isSubmitting}
                >
                  ← Назад
                </Button>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                variant="ghost"
                onClick={handleCloseAttempt}
                disabled={isSubmitting}
                className="cursor-pointer"
              >
                Отмена
              </Button>

              {!isLastStep ? (
                <Button
                  onClick={handleNext}
                  disabled={isSubmitting}
                  className="cursor-pointer"
                >
                  Далее →
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  className="cursor-pointer"
                  disabled={isSubmitting}
                  loading={isSubmitting}
                >
                  {isSubmitting ? "Создание..." : "Создать запрос"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </Modal>

      {/* Подтверждение закрытия */}
      <ConfirmModal
        isOpen={showCloseConfirm}
        onClose={() => setShowCloseConfirm(false)}
        onConfirm={handleConfirmClose}
        title="Подтверждение закрытия"
        message="Вы уверены, что хотите закрыть создание запроса отчета? Все введенные данные будут потеряны."
        confirmText="Да, закрыть"
        cancelText="Продолжить редактирование"
        variant="warning"
      />

      {/* Уведомление об успехе */}
      {showSuccessNotification && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-2xl p-8 max-w-md w-full mx-4 animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-green-600 dark:text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Запрос успешно создан!
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Запрос на формирование отчета "{currentConfig.title}" помещен
                  в очередь выполнения. Отчет будет отправлен по email при
                  готовности.
                </p>
              </div>

              <Button
                onClick={handleSuccessClose}
                className="w-full cursor-pointer"
              >
                Понятно
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
