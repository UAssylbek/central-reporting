// frontend/src/features/reports/configs/index.ts
import type { ReportModalConfig } from "../../../shared/types/reportConfig";
import type { ReportType } from "../../../shared/types/reports";

// Импорт всех конфигураций отчётов
import { consolidatedStatementConfig } from "./consolidated-statement.config";
import { tariffListConfig } from "./tariff-list.config";
import { osBalanceConfig } from "./os-balance.config";
import { expenseReportConfig } from "./expense-report.config";
import { longTermSearchConfig } from "./long-term-search.config";
import { tmzBalanceConfig } from "./tmz-balance.config";
import { cashFlowConfig } from "./cash-flow.config";
import { employeeListConfig } from "./employee-list.config";
import { debtReportConfig } from "./debt-report.config";

/**
 * Карта всех конфигураций отчётов
 */
const REPORT_CONFIGS: Record<ReportType, ReportModalConfig> = {
  consolidated_statement: consolidatedStatementConfig,
  tariff_list: tariffListConfig,
  os_balance: osBalanceConfig,
  expense_report: expenseReportConfig,
  long_term_search: longTermSearchConfig,
  tmz_balance: tmzBalanceConfig,
  cash_flow: cashFlowConfig,
  employee_list: employeeListConfig,
  debt_report: debtReportConfig,
};

/**
 * Получить конфигурацию отчёта по типу
 */
export function getReportConfig(
  reportType: ReportType
): ReportModalConfig | undefined {
  return REPORT_CONFIGS[reportType];
}

/**
 * Получить все конфигурации отчётов
 */
export function getAllReportConfigs(): Record<ReportType, ReportModalConfig> {
  return REPORT_CONFIGS;
}

// Экспорт отдельных конфигураций
export {
  consolidatedStatementConfig,
  tariffListConfig,
  osBalanceConfig,
  expenseReportConfig,
  longTermSearchConfig,
  tmzBalanceConfig,
  cashFlowConfig,
  employeeListConfig,
  debtReportConfig,
};
