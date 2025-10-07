// frontend/src/features/reports/UniversalReportModal/UniversalReportModal.tsx
import { useEffect, useState } from "react";
import { Modal } from "../../../shared/ui/Modal/Modal";
import { Button } from "../../../shared/ui/Button/Button";
import { StepNavigation } from "../../../shared/ui/StepNavigation/StepNavigation";
import { useModalSteps } from "../../../shared/hooks/useModalSteps";
import { useReportForm } from "../../../shared/hooks/useReportForm";
import { OrganizationStep } from "../steps/OrganizationStep";
import { ReportParamsStep } from "../steps/ReportParamsStep";
import { EmailStep } from "../steps/EmailStep";
import type { ReportType } from "../../../shared/types/reports";
import type { ReportModalConfig } from "../../../shared/types/reportConfig";
import { REPORTS_LIST } from "../../../shared/config/reportsList";

// Временные компоненты для отсутствующих шагов
function ReportSelectionStep({
  selectedReport,
}: {
  selectedReport: ReportType;
  onChange: (type: ReportType) => void;
}) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        Выбор отчёта
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {REPORTS_LIST.map((report) => (
          <div
            key={report.id}
            className={`p-4 border rounded-lg cursor-pointer ${
              selectedReport === report.id
                ? "border-blue-500"
                : "border-gray-200"
            }`}
          >
            <span className="text-2xl">{report.icon}</span>
            <h4 className="font-semibold mt-2">{report.title}</h4>
            <p className="text-sm text-gray-600 mt-1">{report.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ConfirmationStep({
  reportTitle,
  config,
  formData,
  organizationCount,
}: {
  reportTitle: string;
  config: ReportModalConfig;
  formData: Record<string, unknown>;
  organizationCount: number;
}) {
  return (
    <div className="space-y-6">
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
        <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
          Подтверждение
        </h3>
        <p className="text-sm text-blue-800 dark:text-blue-200">
          Проверьте параметры запроса перед отправкой
        </p>
      </div>
      <div className="space-y-3">
        <div className="flex gap-2">
          <span className="font-medium min-w-[180px]">Отчёт:</span>
          <span>{reportTitle}</span>
        </div>
        <div className="flex gap-2">
          <span className="font-medium min-w-[180px]">Организаций:</span>
          <span>{organizationCount}</span>
        </div>
        {config.steps
          .flatMap((s) => s.fields)
          .map((field) => {
            const value = formData[field.name];
            if (!value) return null;

            return (
              <div key={field.name} className="flex gap-2">
                <span className="font-medium min-w-[180px]">
                  {field.label}:
                </span>
                <span>
                  {typeof value === "boolean"
                    ? value
                      ? "Да"
                      : "Нет"
                    : typeof value === "string" || typeof value === "number"
                    ? value
                    : JSON.stringify(value)}
                </span>
              </div>
            );
          })}
      </div>
    </div>
  );
}

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
      // Устанавливаем стартовый шаг (обычно 1, что означает страницу "Организации")
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

  // Обработчик смены отчёта на первой странице
  const handleReportChange = (newReportType: ReportType) => {
    // Импортируем конфиг нового отчёта
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

    // Шаг 0: Выбор отчета
    if (currentStep === STEP_REPORT_SELECTION) {
      return true;
    }

    // Шаг 1: Организации
    if (currentStep === STEP_ORGANIZATIONS) {
      if (formData.organizationIds.length === 0) {
        newErrors.organizations = "Выберите хотя бы одну организацию";
        setErrors(newErrors);
        return false;
      }
    }

    // Шаги параметров отчёта
    if (currentStep >= STEP_PARAMS_START && currentStep <= STEP_PARAMS_END) {
      const stepIndex = currentStep - STEP_PARAMS_START;
      const stepConfig = currentConfig.steps[stepIndex];

      stepConfig.fields.forEach((field) => {
        const value = formData[field.name];

        // Проверка обязательных полей
        if (field.required && !value) {
          newErrors[
            field.name
          ] = `Поле "${field.label}" обязательно для заполнения`;
        }

        // Кастомная валидация
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

    // Шаг Email
    if (currentStep === STEP_EMAIL) {
      if (formData.emailNotification && formData.recipients.length === 0) {
        newErrors.recipients = "Добавьте хотя бы один email адрес";
      }
    }

    // Шаг Подтверждение
    if (currentStep === STEP_CONFIRMATION) {
      return true;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      nextStep();
    }
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
        // TODO: Вызов API для генерации отчёта
        console.log("Submitting report:", formData);
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      // Успешно - закрываем модалку
      onClose();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Ошибка при создании запроса";
      setErrors({ submit: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderCurrentStep = () => {
    // Шаг 0: Выбор отчета
    if (currentStep === STEP_REPORT_SELECTION) {
      return (
        <ReportSelectionStep
          selectedReport={currentReportType}
          onChange={allowReportChange ? handleReportChange : () => {}}
        />
      );
    }

    // Шаг 1: Организации
    if (currentStep === STEP_ORGANIZATIONS) {
      return (
        <OrganizationStep
          selectedOrganizations={formData.organizationIds}
          onChange={(orgs) => updateField("organizationIds", orgs)}
        />
      );
    }

    // Шаги параметров отчёта
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

    // Шаг Email
    if (currentStep === STEP_EMAIL) {
      return (
        <EmailStep
          emailNotification={formData.emailNotification}
          recipients={formData.recipients}
          onChange={updateField}
        />
      );
    }

    // Шаг Подтверждение
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
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={currentConfig.title}
      size="xl"
      closeOnOverlayClick={false}
    >
      <div className="space-y-6">
        {/* Step Navigation */}
        <StepNavigation
          steps={stepLabels}
          currentStep={currentStep}
          allowJump={false}
        />

        {/* Current Step Content */}
        <div className="min-h-[400px]">{renderCurrentStep()}</div>

        {/* Error message */}
        {errors.submit && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-800 dark:text-red-200 text-sm">
              {errors.submit}
            </p>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-zinc-700">
          <div>
            {!isFirstStep && (
              <Button
                variant="secondary"
                className="cursor-pointer"
                onClick={prevStep}
                disabled={isSubmitting}
              >
                ← Назад
              </Button>
            )}
          </div>

          <div className="flex gap-3">
            <Button variant="ghost" onClick={onClose} disabled={isSubmitting} className="cursor-pointer">
              Отмена
            </Button>

            {!isLastStep ? (
              <Button onClick={handleNext} disabled={isSubmitting} className="cursor-pointer">
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
  );
}
