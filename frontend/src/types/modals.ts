// Базовые типы для всех модальных окон

export interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportTitle: string;
}

export interface ModalStepProps {
  formData: any;
  updateFormData: (data: any) => void;
  errors?: { [key: string]: string };
  onValidationChange?: (isValid: boolean) => void;
}

// Общие поля для всех отчетов
export interface BaseReportFormData {
  organization: string;
  period: string;
  outputFormat: "PDF" | "XLSX" | "CSV";
  includeComments: boolean;
  emailNotification: boolean;
  recipients: string[];
}

// Типы для каждого конкретного отчета
export interface ConsolidatedStatementFormData extends BaseReportFormData {
  department: string;
  includeSubdivisions: boolean;
  reportType: "standard" | "extended" | "summary";
  currency: "KZT" | "USD" | "EUR";
  detailLevel: "summary" | "detailed" | "full";
}

export interface TariffListFormData extends BaseReportFormData {
  employeeCategory: "all" | "permanent" | "temporary" | "contract";
  includeVacantPositions: boolean;
  groupByDepartment: boolean;
  salaryRange: {
    min: number;
    max: number;
  };
}

export interface OSBalanceFormData extends BaseReportFormData {
  assetCategory: string;
  includeWriteOffs: boolean;
  includeRevaluations: boolean;
  groupByLocation: boolean;
  minValue: number;
}

export interface LongTermSearchFormData extends BaseReportFormData {
  searchCriteria: {
    assetName?: string;
    inventoryNumber?: string;
    location?: string;
    responsiblePerson?: string;
  };
  dateRange: {
    from: string;
    to: string;
  };
  assetStatus: "all" | "active" | "written_off" | "transferred";
}

export interface TMZBalanceFormData extends BaseReportFormData {
  warehouseLocation: string;
  includeReserved: boolean;
  includeInTransit: boolean;
  groupByCategory: boolean;
  showZeroBalances: boolean;
}

export interface ExpenseReportFormData extends BaseReportFormData {
  expenseCategories: string[];
  budgetProgram: string;
  includeApprovedOnly: boolean;
  comparisonPeriod?: string;
  groupByMonth: boolean;
}

export interface CashFlowReportFormData extends BaseReportFormData {
  bankAccounts: string[];
  includePlannedTransactions: boolean;
  transactionTypes: ("income" | "expense" | "transfer")[];
  groupByCurrency: boolean;
  showDailyBreakdown: boolean;
}

export interface EmployeeListFormData extends BaseReportFormData {
  includePersonalData: boolean;
  includeSalaryInfo: boolean;
  employmentStatus: "all" | "active" | "on_leave" | "terminated";
  sortBy: "name" | "department" | "position" | "hire_date";
  departments: string[];
}

export interface DebtReportFormData extends BaseReportFormData {
  debtTypes: ("receivables" | "payables")[];
  includeOverdue: boolean;
  agingPeriods: boolean;
  minAmount: number;
  counterpartyTypes: string[];
}

// Типы для валидации
export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// Типы для API запросов
export interface ReportRequest {
  reportType: string;
  formData: any;
}

export interface ReportResponse {
  success: boolean;
  reportId?: string;
  downloadUrl?: string;
  error?: string;
}

// Типы для выбора организаций
export interface Organization {
  id: number;
  name: string;
  code: string;
  type: string;
}
