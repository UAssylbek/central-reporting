// frontend/src/shared/types/reportConfig.ts

import type { ReportType, ReportColorScheme } from "./reports";

/**
 * Типы полей в форме отчёта
 */
export type ReportFieldType =
  | "text"
  | "email"
  | "date"
  | "month"
  | "select"
  | "radio"
  | "checkbox"
  | "number"
  | "textarea"
  | "search"; // ← ДОБАВЛЕН ТИП SEARCH

/**
 * Опция для search поля
 */
export interface SearchOption {
  id: string | number;
  name: string;
  description?: string;
}

/**
 * Конфигурация для search поля
 */
export interface SearchConfig {
  modalTitle: string;
  searchPlaceholder: string;
  noResultsText?: string;
  loadOptions: () => Promise<SearchOption[]> | SearchOption[];
}

/**
 * Опция для select/radio полей
 */
export interface FieldOption {
  value: string;
  label: string;
}

/**
 * Конфигурация поля формы
 */
export interface ReportFieldConfig {
  name: string;
  label: string;
  type: ReportFieldType;
  required?: boolean;
  placeholder?: string;
  description?: string;
  options?: string[] | FieldOption[];
  validation?: (
    value: unknown,
    formData?: Record<string, unknown>
  ) => boolean | string;
  defaultValue?: unknown;
  searchConfig?: SearchConfig; // ← ДОБАВЛЕНО ДЛЯ SEARCH ПОЛЕЙ
}

/**
 * Конфигурация шага в модальном окне
 */
export interface ReportStepConfig {
  id: string;
  title: string;
  description: string;
  fields: ReportFieldConfig[];
}

/**
 * Полная конфигурация отчёта
 */
export interface ReportModalConfig {
  id: ReportType;
  title: string;
  description: string;
  icon: string;
  colorScheme: ReportColorScheme;
  steps: ReportStepConfig[];
}

/**
 * Данные формы отчёта
 */
export interface ReportFormData {
  reportType: ReportType;
  organizationIds: number[];
  emailNotification: boolean;
  recipients: string[];
  [key: string]: unknown; // Дополнительные поля из steps
}
