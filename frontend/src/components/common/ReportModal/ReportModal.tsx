import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import "./ReportModal.css";
import {
  Organization,
  FieldConfig,
  ModalConfig,
  ReportModalProps,
  FormData,
  SearchOption,
} from "./types";

// Компонент модального окна поиска
interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (option: SearchOption) => void;
  title: string;
  options: SearchOption[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
  placeholder: string;
  colorScheme?: string; // ДОБАВИТЬ
}

const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  title,
  options,
  searchTerm,
  onSearchChange,
  placeholder,
  colorScheme = "blue",
}) => {
  const [filteredOptions, setFilteredOptions] = useState<SearchOption[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredOptions(options);
    } else {
      setFilteredOptions(
        options.filter((option) =>
          option.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
  }, [searchTerm, options]);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setTimeout(() => setIsAnimating(true), 10);
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => setShouldRender(false), 400);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!shouldRender) return null;

  return (
    <div
      className={`rm-search-modal-overlay rm-theme-${colorScheme} ${
        isAnimating ? "rm-search-open" : ""
      }`}
      onClick={onClose}
    >
      <div
        className={`rm-search-modal-content ${
          isAnimating ? "rm-search-open" : ""
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="rm-modal-header">
          <h2>{title}</h2>
          <button className="rm-modal-close" onClick={onClose} type="button">
            ×
          </button>
        </div>

        <div className="rm-modal-body">
          <div className="rm-form-group">
            <label htmlFor="search-input">Наименование</label>
            <input
              id="search-input"
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={placeholder}
              autoFocus
            />
          </div>

          <div className="rm-search-results">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <div
                  key={option.id}
                  className="rm-search-option"
                  onClick={() => {
                    onSelect(option);
                  }}
                >
                  <div className="rm-search-option-name">{option.name}</div>
                  {option.description && (
                    <div className="rm-search-option-description">
                      {option.description}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="rm-search-no-results">
                Ничего не найдено по запросу "{searchTerm}"
              </div>
            )}
          </div>
        </div>

        <div className="rm-modal-actions">
          <div className="rm-actions-left"></div>
          <div className="rm-actions-right">
            <button
              type="button"
              onClick={onClose}
              className="rm-btn rm-btn-secondary"
            >
              Закрыть
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  reportTitle,
  config,
  onReportChange,
}) => {
  const [currentStep, setCurrentStep] = useState(config.startStep || 1);
  const [slideDirection, setSlideDirection] = useState<"left" | "right" | null>(
    null
  );
  const [isAnimating, setIsAnimating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [showCloseConfirmation, setShowCloseConfirmation] = useState(false);
  const [searchModals, setSearchModals] = useState<Record<string, boolean>>({});
  const [searchData, setSearchData] = useState<
    Record<string, { options: SearchOption[]; searchTerm: string }>
  >({});

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
    selectedReportId: config.defaultReportId,
  });

  // Объявляем константы шагов
  const totalSteps = 1 + 1 + config.steps.length + 1 + 1;
  const reportSelectionStep = 1;
  const organizationStep = 2;
  const configStepsStart = 3;
  const configStepsEnd = configStepsStart + config.steps.length - 1;
  const emailStep = configStepsEnd + 1;
  const summaryStep = emailStep + 1;

  // Все функции валидации и обработчиков
  const validateCurrentStep = (): boolean => {
    if (currentStep === reportSelectionStep) {
      return !!formData.selectedReportId && formData.selectedReportId !== "";
    }

    if (currentStep === organizationStep) {
      return formData.selectedOrganizations?.length > 0;
    }

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

    if (currentStep === emailStep) {
      return formData.emails?.some(
        (email: string) => email.trim() !== "" && isValidEmail(email)
      );
    }

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
    if (validateCurrentStep() && currentStep < totalSteps && !isAnimating) {
      setIsAnimating(true);
      setSlideDirection("left");

      setTimeout(() => {
        setCurrentStep(currentStep + 1);
        setTimeout(() => {
          setSlideDirection(null);
          setIsAnimating(false);
        }, 50);
      }, 300);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1 && !isAnimating) {
      setIsAnimating(true);
      setSlideDirection("right");

      setTimeout(() => {
        setCurrentStep(currentStep - 1);
        setTimeout(() => {
          setSlideDirection(null);
          setIsAnimating(false);
        }, 50);
      }, 300);
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

  const handleCloseAttempt = () => {
    setShowCloseConfirmation(true);
  };

  const confirmClose = () => {
    setShowCloseConfirmation(false);
    onClose();
  };

  const cancelClose = () => {
    setShowCloseConfirmation(false);
  };

  const handleSuccessClose = () => {
    setShowSuccessNotification(false);
    onClose();
  };

  const updateFormData = (key: string, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const openSearchModal = async (fieldName: string, field: FieldConfig) => {
    if (!field.searchConfig) return;

    setSearchModals((prev) => ({ ...prev, [fieldName]: true }));

    if (!searchData[fieldName]) {
      try {
        const options = await field.searchConfig.loadOptions();
        setSearchData((prev) => ({
          ...prev,
          [fieldName]: {
            options: Array.isArray(options) ? options : [],
            searchTerm: "",
          },
        }));
      } catch (error) {
        console.error("Ошибка загрузки опций поиска:", error);
        setSearchData((prev) => ({
          ...prev,
          [fieldName]: { options: [], searchTerm: "" },
        }));
      }
    }
  };

  const closeSearchModal = (fieldName: string) => {
    setSearchModals((prev) => ({ ...prev, [fieldName]: false }));
  };

  const handleSearchSelect = (fieldName: string, option: SearchOption) => {
    updateFormData(fieldName, option.name);
    updateFormData(`${fieldName}_id`, option.id);
    closeSearchModal(fieldName);
  };

  const handleSearchTermChange = (fieldName: string, value: string) => {
    setSearchData((prev) => ({
      ...prev,
      [fieldName]: { ...prev[fieldName], searchTerm: value },
    }));
  };

  const showAllOptions = async (fieldName: string, field: FieldConfig) => {
    if (!field.searchConfig) return;

    try {
      const options = await field.searchConfig.loadOptions();
      setSearchData((prev) => ({
        ...prev,
        [fieldName]: {
          options: Array.isArray(options) ? options : [],
          searchTerm: "",
        },
      }));
      setSearchModals((prev) => ({ ...prev, [fieldName]: true }));
    } catch (error) {
      console.error("Ошибка загрузки всех опций:", error);
    }
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

  // useEffect для блокировки скролла
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }

    return () => {
      document.body.classList.remove("modal-open");
    };
  }, [isOpen]);

  // useEffect для клавиатурной навигации с последовательным переходом по полям
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isAnimating || isSubmitting) return;

      const hasOpenSearchModal = Object.values(searchModals).some(
        (isOpen) => isOpen
      );
      if (hasOpenSearchModal) return;

      // НАВИГАЦИЯ ДЛЯ ДИАЛОГА ПОДТВЕРЖДЕНИЯ ЗАКРЫТИЯ
      if (showCloseConfirmation) {
        if (e.key === "Enter") {
          e.preventDefault();
          confirmClose(); // Закрыть
        }
        if (e.key === "Escape") {
          e.preventDefault();
          cancelClose(); // Продолжить редактирование
        }
        return; // Блокируем остальную навигацию
      }

      // НАВИГАЦИЯ ДЛЯ УВЕДОМЛЕНИЯ ОБ УСПЕХЕ
      if (showSuccessNotification) {
        if (e.key === "Enter" || e.key === "Escape") {
          e.preventDefault();
          handleSuccessClose(); // Понятно
        }
        return; // Блокируем остальную навигацию
      }

      // ОСНОВНАЯ НАВИГАЦИЯ ПО ФОРМЕ
      if (e.key === "Enter") {
        e.preventDefault();

        const modalBody = document.querySelector(".rm-modal-body");
        if (!modalBody) return;

        const focusableElements = modalBody.querySelectorAll(
          'input:not([type="radio"]):not([type="checkbox"]), select, textarea, input[type="radio"]:checked'
        );

        const focusableArray = Array.from(focusableElements) as HTMLElement[];
        const activeElement = document.activeElement as HTMLElement;
        const currentIndex = focusableArray.indexOf(activeElement);

        const isStepValid = validateCurrentStep();

        if (currentIndex !== -1) {
          let nextIndex = currentIndex + 1;

          while (nextIndex < focusableArray.length) {
            const nextElement = focusableArray[nextIndex];

            if (
              nextElement instanceof HTMLInputElement ||
              nextElement instanceof HTMLSelectElement ||
              nextElement instanceof HTMLTextAreaElement
            ) {
              if (!nextElement.value || nextElement.value === "") {
                nextElement.focus();
                return;
              }
            }

            nextIndex++;
          }

          if (isStepValid) {
            if (currentStep < totalSteps) {
              handleNext();
            } else if (currentStep === totalSteps) {
              handleSubmit();
            }
          }
        } else {
          const firstEmptyField = focusableArray.find((element) => {
            if (
              element instanceof HTMLInputElement ||
              element instanceof HTMLSelectElement ||
              element instanceof HTMLTextAreaElement
            ) {
              return !element.value || element.value === "";
            }
            return false;
          });

          if (firstEmptyField) {
            firstEmptyField.focus();
          } else if (isStepValid) {
            if (currentStep < totalSteps) {
              handleNext();
            } else if (currentStep === totalSteps) {
              handleSubmit();
            }
          }
        }
      }

      if (e.key === "Escape") {
        e.preventDefault();
        handleCloseAttempt();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    isOpen,
    currentStep,
    totalSteps,
    isAnimating,
    isSubmitting,
    searchModals,
    formData,
    showCloseConfirmation,
    showSuccessNotification,
  ]);

  const renderField = (field: FieldConfig) => {
    const value = formData[field.name];

    switch (field.type) {
      case "search":
        if (!field.searchConfig) return null;

        // Получаем отфильтрованные опции для показа подсказок
        const currentSearchTerm = value || "";
        const filteredSuggestions = (searchData[field.name]?.options || [])
          .filter((option) =>
            option.name.toLowerCase().includes(currentSearchTerm.toLowerCase())
          )
          .slice(0, 5); // Показываем только первые 5 результатов

        return (
          <div className="rm-form-group" key={field.name}>
            <label htmlFor={field.name}>{field.label}:</label>
            <div className="rm-search-field">
              <div className="rm-search-input-wrapper">
                <input
                  id={field.name}
                  type="text"
                  value={value || ""}
                  onChange={async (e) => {
                    const inputValue = e.target.value;
                    updateFormData(field.name, inputValue);

                    // Автоматически загружаем опции при первом вводе БЕЗ открытия модалки
                    if (
                      !searchData[field.name] &&
                      inputValue.length > 0 &&
                      field.searchConfig
                    ) {
                      try {
                        const options = await field.searchConfig.loadOptions();
                        setSearchData((prev) => ({
                          ...prev,
                          [field.name]: {
                            options: Array.isArray(options) ? options : [],
                            searchTerm: "",
                          },
                        }));
                      } catch (error) {
                        console.error("Ошибка загрузки опций поиска:", error);
                      }
                    }
                  }}
                  placeholder={field.searchConfig.searchPlaceholder}
                  required={field.required}
                  className="rm-search-text-input"
                />
                <button
                  type="button"
                  className="rm-search-dropdown-btn"
                  onClick={() => openSearchModal(field.name, field)}
                >
                  ▼
                </button>
              </div>

              {/* Показываем подсказки при вводе */}
              {currentSearchTerm.length > 0 &&
                filteredSuggestions.length > 0 && (
                  <div className="rm-search-suggestions">
                    {filteredSuggestions.map((option) => (
                      <div
                        key={option.id}
                        className="rm-search-suggestion-item"
                        onClick={() => handleSearchSelect(field.name, option)}
                      >
                        <div className="rm-search-option-name">
                          {option.name}
                        </div>
                        {option.description && (
                          <div className="rm-search-option-description">
                            {option.description}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

              {(!value || value.trim() === "") && (
                <div className="rm-search-helper">
                  <p>
                    Введите строку для поиска. Нажмите "Показать все" для выбора
                  </p>
                  <button
                    type="button"
                    className="rm-btn rm-btn-outline rm-btn-small"
                    onClick={() => showAllOptions(field.name, field)}
                  >
                    Показать все
                  </button>
                </div>
              )}
            </div>
          </div>
        );
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
    if (currentStep === reportSelectionStep) {
      const selectedReport = config.reportOptions?.find(
        (report) => report.id === formData.selectedReportId
      );

      return (
        <div
          className={`rm-step-content ${
            slideDirection === "left"
              ? "rm-slide-out-left"
              : slideDirection === "right"
              ? "rm-slide-out-right"
              : "rm-slide-in"
          }`}
        >
          <p className="rm-description">
            Выберите отчет, по которому будет создан запрос и нажмите "Далее"
            для ввода параметров
          </p>

          <div className="rm-form-group">
            <label htmlFor="reportSelection">Отчет:</label>
            <select
              id="reportSelection"
              value={formData.selectedReportId || ""}
              onChange={(e) => {
                const newReportId = e.target.value;
                updateFormData("selectedReportId", newReportId);

                config.steps
                  .flatMap((step) => step.fields)
                  .forEach((field) => {
                    updateFormData(field.name, undefined);
                  });

                if (onReportChange) {
                  onReportChange(newReportId);
                }
              }}
              required
            >
              <option value="">-- Выберите отчет --</option>{" "}
              {/* Добавить пустой option */}
              {config.reportOptions?.map((report) => (
                <option key={report.id} value={report.id}>
                  {report.title}
                </option>
              ))}
            </select>
          </div>

          {selectedReport && (
            <div className="rm-report-description">
              <p>{selectedReport.description}</p>
            </div>
          )}
        </div>
      );
    }

    if (currentStep === organizationStep) {
      return (
        <div
          className={`rm-step-content ${
            slideDirection === "left"
              ? "rm-slide-out-left"
              : slideDirection === "right"
              ? "rm-slide-out-right"
              : "rm-slide-in"
          }`}
        >
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

    if (currentStep >= configStepsStart && currentStep <= configStepsEnd) {
      const stepIndex = currentStep - configStepsStart;
      const step = config.steps[stepIndex];

      if (!step) return null;

      return (
        <div
          className={`rm-step-content ${
            slideDirection === "left"
              ? "rm-slide-out-left"
              : slideDirection === "right"
              ? "rm-slide-out-right"
              : "rm-slide-in"
          }`}
        >
          <p className="rm-description">{step.description}</p>
          {step.fields.map(renderField)}
        </div>
      );
    }

    if (currentStep === emailStep) {
      return (
        <div
          className={`rm-step-content ${
            slideDirection === "left"
              ? "rm-slide-out-left"
              : slideDirection === "right"
              ? "rm-slide-out-right"
              : "rm-slide-in"
          }`}
        >
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

    if (currentStep === summaryStep) {
      return (
        <div
          className={`rm-step-content ${
            slideDirection === "left"
              ? "rm-slide-out-left"
              : slideDirection === "right"
              ? "rm-slide-out-right"
              : "rm-slide-in"
          }`}
        >
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

  const CloseConfirmation = () => (
    <div className="rm-success-overlay">
      <div className="rm-success-content">
        <div className="rm-success-icon" style={{ color: "#f59e0b" }}>
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <h3>Подтверждение закрытия</h3>
        <p>
          Вы уверены, что хотите закрыть создание запроса отчета? Все введенные
          данные будут потеряны.
        </p>
        <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
          <button onClick={cancelClose} className="rm-btn rm-btn-secondary">
            Продолжить редактирование
          </button>
          <button onClick={confirmClose} className="rm-btn rm-btn-danger">
            Да, закрыть
          </button>
        </div>
      </div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <div
      className={`rm-modal-overlay rm-theme-${config.colorScheme}`}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="rm-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="rm-modal-header">
          <h2>Создание запроса отчета</h2>
          <button
            className="rm-modal-close"
            onClick={handleCloseAttempt}
            disabled={isSubmitting}
          >
            ×
          </button>
        </div>

        <div className={`rm-modal-body ${isAnimating ? "animating" : ""}`}>
          {renderStepContent()}
        </div>

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
              onClick={handleCloseAttempt}
              className="rm-btn rm-btn-secondary"
              disabled={isSubmitting}
            >
              Отмена
            </button>
          </div>
        </div>

        {showSuccessNotification && <SuccessNotification />}
        {showCloseConfirmation && <CloseConfirmation />}
      </div>
      {/* ВЫНЕСТИ ВСЕ SearchModal СЮДА ЧЕРЕЗ ПОРТАЛ */}
      {config.steps
        .flatMap((step) => step.fields)
        .filter((field) => field.type === "search" && field.searchConfig)
        .map((field) =>
          createPortal(
            <SearchModal
              key={field.name}
              isOpen={searchModals[field.name] || false}
              onClose={() => closeSearchModal(field.name)}
              onSelect={(option) => handleSearchSelect(field.name, option)}
              title={field.searchConfig!.modalTitle}
              options={searchData[field.name]?.options || []}
              searchTerm={searchData[field.name]?.searchTerm || ""}
              onSearchChange={(value) =>
                handleSearchTermChange(field.name, value)
              }
              placeholder={field.searchConfig!.searchPlaceholder}
            />,
            document.body
          )
        )}
    </div>
  );
};

export default ReportModal;
