import React, { useState } from "react";
import "./ReportModal.css";
import {
  Organization,
  FieldConfig,
  ModalConfig,
  ReportModalProps,
  FormData,
} from "./types";

const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  reportTitle,
  config,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);

  // Временные данные организаций
  const [organizations] = useState<Organization[]>([
    { id: 1, name: 'ТОО "Компания 1"' },
    { id: 2, name: 'АО "Предприятие 2"' },
    { id: 3, name: 'ГУ "Учреждение 3"' },
    { id: 4, name: 'ТОО "Организация 4"' },
    { id: 5, name: 'АО "Компания 5"' },
  ]);

  const [formData, setFormData] = useState<FormData>({
    selectedOrganizations: [],
    emails: [""],
  });

  if (!isOpen) return null;

  // Четкая структура шагов: Организации + Конфиг + Email + Сводка
  const totalSteps = 1 + config.steps.length + 1 + 1; // Организации + Конфиг + Email + Сводка
  const organizationStep = 1;
  const configStepsStart = 2;
  const configStepsEnd = configStepsStart + config.steps.length - 1;
  const emailStep = configStepsEnd + 1;
  const summaryStep = emailStep + 1;

  console.log("Структура шагов:", {
    totalSteps,
    organizationStep,
    configStepsStart,
    configStepsEnd,
    emailStep,
    summaryStep,
    currentStep,
  });

  const validateCurrentStep = (): boolean => {
    // Шаг 1: Организации
    if (currentStep === organizationStep) {
      return formData.selectedOrganizations?.length > 0;
    }

    // Конфигурационные шаги (2, 3, 4, ...)
    if (currentStep >= configStepsStart && currentStep <= configStepsEnd) {
      const stepIndex = currentStep - configStepsStart;
      const step = config.steps[stepIndex];

      if (!step) return true;

      return step.fields.every((field) => {
        if (!field.required) return true;

        const value = formData[field.name];

        if (field.validation) {
          return field.validation(value, formData);
        }

        return value !== undefined && value !== "";
      });
    }

    // Email шаг
    if (currentStep === emailStep) {
      return formData.emails?.some(
        (email: string) => email.trim() !== "" && isValidEmail(email)
      );
    }

    // Сводка всегда валидна
    if (currentStep === summaryStep) {
      return true;
    }

    return true;
  };

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleNext = () => {
    if (validateCurrentStep() && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updateFormData = (key: string, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSelectAllOrganizations = () => {
    updateFormData(
      "selectedOrganizations",
      organizations.map((org) => org.id)
    );
  };

  const handleDeselectAllOrganizations = () => {
    updateFormData("selectedOrganizations", []);
  };

  const handleOrganizationToggle = (orgId: number) => {
    const selected = formData.selectedOrganizations || [];
    updateFormData(
      "selectedOrganizations",
      selected.includes(orgId)
        ? selected.filter((id: number) => id !== orgId)
        : [...selected, orgId]
    );
  };

  const handleEmailChange = (index: number, value: string) => {
    const emails = [...(formData.emails || [""])];
    emails[index] = value;
    updateFormData("emails", emails);
  };

  const handleAddEmail = () => {
    updateFormData("emails", [...(formData.emails || [""]), ""]);
  };

  const handleRemoveEmail = (index: number) => {
    if ((formData.emails?.length || 0) > 1) {
      const emails = formData.emails.filter(
        (_: string, i: number) => i !== index
      );
      updateFormData("emails", emails);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      console.log("Создание отчета с параметрами:", {
        reportType: config.id,
        formData,
      });

      setShowSuccessNotification(true);
    } catch (error) {
      alert("Ошибка при создании запроса отчета");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccessNotification(false);
    onClose();
  };

  const renderField = (field: FieldConfig) => {
    const value = formData[field.name];

    switch (field.type) {
      case "select":
        return (
          <div className="rm-form-group" key={field.name}>
            <label htmlFor={field.name}>{field.label}:</label>
            <select
              id={field.name}
              value={value || ""}
              onChange={(e) => updateFormData(field.name, e.target.value)}
              required={field.required}
            >
              <option value="">Выберите {field.label.toLowerCase()}</option>
              {field.options?.map((option) => {
                const optionValue =
                  typeof option === "string" ? option : option.value;
                const optionLabel =
                  typeof option === "string" ? option : option.label;
                return (
                  <option key={optionValue} value={optionValue}>
                    {optionLabel}
                  </option>
                );
              })}
            </select>
          </div>
        );

      case "month":
        return (
          <div className="rm-form-group" key={field.name}>
            <label htmlFor={field.name}>{field.label}:</label>
            <input
              id={field.name}
              type="month"
              value={value || ""}
              onChange={(e) => updateFormData(field.name, e.target.value)}
              required={field.required}
            />
          </div>
        );

      case "date":
        return (
          <div className="rm-form-group" key={field.name}>
            <label htmlFor={field.name}>{field.label}:</label>
            <input
              id={field.name}
              type="date"
              value={value || ""}
              onChange={(e) => updateFormData(field.name, e.target.value)}
              required={field.required}
            />
          </div>
        );

      case "text":
        return (
          <div className="rm-form-group" key={field.name}>
            <label htmlFor={field.name}>{field.label}:</label>
            <input
              id={field.name}
              type="text"
              value={value || ""}
              onChange={(e) => updateFormData(field.name, e.target.value)}
              placeholder={field.placeholder}
              required={field.required}
            />
          </div>
        );

      case "radio":
        return (
          <div className="rm-form-group" key={field.name}>
            <label>{field.label}:</label>
            <div className="rm-radio-group">
              {field.options?.map((option) => {
                const optionValue =
                  typeof option === "string" ? option : option.value;
                const optionLabel =
                  typeof option === "string" ? option : option.label;
                return (
                  <label key={optionValue} className="rm-radio-option">
                    <input
                      type="radio"
                      name={field.name}
                      value={optionValue}
                      checked={value === optionValue}
                      onChange={(e) =>
                        updateFormData(field.name, e.target.value)
                      }
                    />
                    <span>{optionLabel}</span>
                  </label>
                );
              })}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const renderStepContent = () => {
    // Шаг 1: Организации
    if (currentStep === organizationStep) {
      return (
        <div className="rm-step-content">
          <p className="rm-description">
            Выберите организации, данные которых необходимо предоставить в
            отчете
          </p>

          <div className="rm-org-controls">
            <button
              type="button"
              className="rm-btn rm-btn-outline"
              onClick={handleSelectAllOrganizations}
            >
              Выбрать все организации
            </button>
            <button
              type="button"
              className="rm-btn rm-btn-outline"
              onClick={handleDeselectAllOrganizations}
            >
              Снять выбор со всех организаций
            </button>
          </div>

          <div className="rm-org-list">
            {organizations.map((org) => (
              <label key={org.id} className="rm-org-item">
                <input
                  type="checkbox"
                  checked={
                    formData.selectedOrganizations?.includes(org.id) || false
                  }
                  onChange={() => handleOrganizationToggle(org.id)}
                />
                <span className="rm-org-name">{org.name}</span>
              </label>
            ))}
          </div>
        </div>
      );
    }

    // Конфигурационные шаги
    if (currentStep >= configStepsStart && currentStep <= configStepsEnd) {
      const stepIndex = currentStep - configStepsStart;
      const step = config.steps[stepIndex];

      if (!step) return null;

      return (
        <div className="rm-step-content">
          <p className="rm-description">{step.description}</p>
          {step.fields.map(renderField)}
        </div>
      );
    }

    // Email шаг
    if (currentStep === emailStep) {
      return (
        <div className="rm-step-content">
          <p className="rm-description">
            Введите адреса электронной почты, на которые будет отправлен отчет
          </p>

          <div className="rm-emails-section">
            {(formData.emails || [""]).map((email: string, index: number) => (
              <div key={index} className="rm-email-group">
                <label htmlFor={`email-${index}`}>Электронная почта:</label>
                <div className="rm-email-wrapper">
                  <input
                    id={`email-${index}`}
                    type="email"
                    value={email}
                    onChange={(e) => handleEmailChange(index, e.target.value)}
                    placeholder="example@email.com"
                  />
                  {(formData.emails?.length || 0) > 1 && (
                    <button
                      type="button"
                      className="rm-btn rm-btn-danger rm-btn-small"
                      onClick={() => handleRemoveEmail(index)}
                    >
                      Удалить
                    </button>
                  )}
                </div>
              </div>
            ))}

            <button
              type="button"
              className="rm-btn rm-btn-outline"
              onClick={handleAddEmail}
            >
              + Добавить еще
            </button>
          </div>
        </div>
      );
    }

    // Сводка
    if (currentStep === summaryStep) {
      return (
        <div className="rm-step-content">
          <p className="rm-description">
            Ввод параметров завершен. Нажмите "Создать запрос" чтобы завершить
            работу помощника.
          </p>

          <div className="rm-summary">
            <h4>Запрашиваемый отчет: {reportTitle}</h4>

            <div className="rm-summary-item">
              <strong>Параметры отчета:</strong>
            </div>

            {config.steps
              .flatMap((step) => step.fields)
              .map((field) => (
                <div key={field.name} className="rm-summary-item">
                  <strong>{field.label}:</strong>{" "}
                  {formData[field.name] || "Не указано"}
                </div>
              ))}

            <div className="rm-summary-item">
              <strong>Получатели:</strong>{" "}
              {formData.emails
                ?.filter((email: string) => email.trim())
                .join(", ") || "Не указаны"}
            </div>

            <div className="rm-summary-item">
              <strong>Выбрано организаций:</strong>{" "}
              {formData.selectedOrganizations?.length || 0} из{" "}
              {organizations.length}
            </div>
          </div>

          <div className="rm-final-note">
            Запрос будет помещен в очередь выполнения запросов. После выполнения
            запроса отчет будет автоматически сформирован и отправлен по
            электронной почте получателям.
          </div>
        </div>
      );
    }

    return null;
  };

  // Success Notification Component
  const SuccessNotification = () => (
    <div className="rm-success-overlay">
      <div className="rm-success-content">
        <div className="rm-success-icon">
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22,4 12,14.01 9,11.01" />
          </svg>
        </div>
        <h3>Запрос успешно создан!</h3>
        <p>
          Запрос на формирование отчета "{reportTitle}" помещен в очередь
          выполнения. Отчет будет отправлен по email при готовности.
        </p>
        <button onClick={handleSuccessClose} className="rm-btn rm-btn-success">
          Понятно
        </button>
      </div>
    </div>
  );

  return (
    <div
      className={`rm-modal-overlay rm-theme-${config.colorScheme}`}
      onClick={onClose}
    >
      <div className="rm-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="rm-modal-header">
          <h2>Создание запроса отчета</h2>
          <button
            className="rm-modal-close"
            onClick={onClose}
            disabled={isSubmitting}
          >
            ×
          </button>
        </div>

        <div className="rm-modal-body">{renderStepContent()}</div>

        <div className="rm-modal-actions">
          <div className="rm-actions-left">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handlePrev}
                className="rm-btn rm-btn-secondary"
                disabled={isSubmitting}
              >
                Назад
              </button>
            )}
          </div>

          <div className="rm-actions-right">
            {currentStep < totalSteps ? (
              <button
                type="button"
                onClick={handleNext}
                className="rm-btn rm-btn-primary"
                disabled={!validateCurrentStep() || isSubmitting}
              >
                Далее
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                className="rm-btn rm-btn-success"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Создание запроса..." : "Создать запрос"}
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="rm-btn rm-btn-secondary"
              disabled={isSubmitting}
            >
              Отмена
            </button>
          </div>
        </div>

        {showSuccessNotification && <SuccessNotification />}
      </div>
    </div>
  );
};

export default ReportModal;
