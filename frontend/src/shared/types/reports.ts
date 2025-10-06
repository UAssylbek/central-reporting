// frontend/src/shared/types/reports.ts

/**
 * Типы отчётов в системе
 */
export type ReportType =
  | "consolidated_statement"
  | "tariff_list"
  | "os_balance"
  | "long_term_search"
  | "tmz_balance"
  | "expense_report"
  | "cash_flow"
  | "employee_list"
  | "debt_report";

/**
 * Цветовые схемы для отчётов
 */
export type ReportColorScheme =
  | "blue"
  | "orange"
  | "green"
  | "purple"
  | "red"
  | "indigo"
  | "pink"
  | "yellow"
  | "cyan";

/**
 * Конфигурация отчёта для отображения
 */
export interface ReportConfig {
  id: ReportType;
  title: string;
  description: string;
  icon: string;
  colorScheme: ReportColorScheme;
  category?: string;
}

/**
 * Базовые параметры для генерации отчёта
 */
export interface BaseReportParams {
  organizationIds: number[];
  dateFrom?: string;
  dateTo?: string;
  format: "pdf" | "excel" | "csv";
  emailNotification?: boolean;
  recipients?: string[];
}

/**
 * Запрос на генерацию отчёта (для будущего API)
 */
export interface GenerateReportRequest {
  reportType: ReportType;
  params: BaseReportParams & Record<string, any>;
}

/**
 * Ответ от API после генерации отчёта (для будущего API)
 */
export interface GenerateReportResponse {
  success: boolean;
  reportId?: string;
  downloadUrl?: string;
  message?: string;
  error?: string;
}

/**
 * Статус отчёта
 */
export type ReportStatus = "pending" | "processing" | "completed" | "failed";

/**
 * Информация о сгенерированном отчёте (для будущего)
 */
export interface GeneratedReport {
  id: string;
  reportType: ReportType;
  title: string;
  status: ReportStatus;
  createdAt: string;
  completedAt?: string;
  downloadUrl?: string;
  fileSize?: number;
  format: "pdf" | "excel" | "csv";
}