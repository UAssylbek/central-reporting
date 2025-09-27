// types.ts - Обновленные типы для общего компонента ReportModal
export interface Organization {
  id: number;
  name: string;
}

export interface SearchOption {
  id: string | number;
  name: string;
  description?: string;
}

export interface FieldConfig {
  name: string;
  label: string;
  type:
    | "select"
    | "month"
    | "radio"
    | "text"
    | "email"
    | "number"
    | "date"
    | "search";
  options?: string[] | { value: string; label: string }[];
  required?: boolean;
  validation?: (value: any, formData?: any) => boolean;
  placeholder?: string;
  description?: string;
  // Новые поля для search типа
  searchConfig?: {
    modalTitle: string;
    searchPlaceholder: string;
    noResultsText: string;
    loadOptions: () => Promise<SearchOption[]> | SearchOption[];
  };
}

export interface StepConfig {
  title: string;
  description: string;
  fields: FieldConfig[];
}

export interface ReportOption {
  id: string;
  title: string;
  description: string;
}

export interface ModalConfig {
  id: string;
  title: string;
  steps: StepConfig[];
  colorScheme: "blue" | "orange" | "green" | "purple" | "red";
  // Добавляем возможность указать стартовый шаг
  startStep?: number;
  // Добавляем опции отчетов для первой страницы
  reportOptions?: ReportOption[];
  defaultReportId?: string;
}

export interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportTitle: string;
  config: ModalConfig;
  onReportChange?: (reportId: string) => void; // Добавляем опциональный пропс
}

export interface FormData {
  selectedOrganizations: number[];
  emails: string[];
  [key: string]: any;
}
