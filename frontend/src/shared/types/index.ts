// frontend/src/shared/types/index.ts

/**
 * Общие типы приложения
 */

// Re-export типов из API
export type { User, LoginRequest, LoginResponse, ChangePasswordRequest } from "../api/auth.api";
export type {
  Organization,
  CreateUserRequest,
  UpdateUserRequest,
  UsersListResponse,
} from "../api/users.api";

// Re-export типов отчётов
export type {
  ReportType,
  ReportColorScheme,
  ReportConfig,
  BaseReportParams,
  GenerateReportRequest,
  GenerateReportResponse,
  ReportStatus,
  GeneratedReport,
} from "./reports";

// Re-export типов конфигураций отчётов
export type {
  ReportFieldType,
  FieldOption,
  ReportFieldConfig,
  ReportStepConfig,
  ReportModalConfig,
  ReportFormData,
} from "./reportConfig";

/**
 * Утилитарные типы
 */
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;

/**
 * Типы для форм
 */
export interface FormFieldError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: FormFieldError[];
}