// frontend/src/features/reports/configs/index.ts
import type { ReportModalConfig } from "../../../shared/types/reportConfig";
import type { ReportType } from "../../../shared/types/reports";
import { consolidatedStatementConfig } from "./consolidated-statement.config";
import { tariffListConfig } from "./tariff-list.config";
import { osBalanceConfig } from "./os-balance.config";
import { expenseReportConfig } from "./expense-report.config";

/**
 * Карта всех конфигураций отчётов
 */
const REPORT_CONFIGS: Record<ReportType, ReportModalConfig> = {
  consolidated_statement: consolidatedStatementConfig,
  tariff_list: tariffListConfig,
  os_balance: osBalanceConfig,
  expense_report: expenseReportConfig,
  
  // Остальные конфиги будут добавлены позже
  long_term_search: osBalanceConfig, // Временная заглушка
  tmz_balance: osBalanceConfig,
  cash_flow: osBalanceConfig,
  employee_list: osBalanceConfig,
  debt_report: osBalanceConfig,
};

/**
 * Получить конфигурацию отчёта по типу
 */
export function getReportConfig(reportType: ReportType): ReportModalConfig | undefined {
  return REPORT_CONFIGS[reportType];
}

export { consolidatedStatementConfig, tariffListConfig, osBalanceConfig, expenseReportConfig };