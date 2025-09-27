// types.ts - Типы для общего компонента ReportModal

export interface Organization {
  id: number;
  name: string;
}

export interface FieldConfig {
  name: string;
  label: string;
  type: "select" | "month" | "radio" | "text" | "email" | "number" | "date";
  options?: string[] | { value: string; label: string }[];
  required?: boolean;
  validation?: (value: any, formData?: any) => boolean;
  placeholder?: string;
  description?: string;
}

export interface StepConfig {
  title: string;
  description: string;
  fields: FieldConfig[];
}

export interface ModalConfig {
  id: string;
  title: string;
  steps: StepConfig[];
  colorScheme: "blue" | "orange" | "green" | "purple" | "red";
}

export interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportTitle: string;
  config: ModalConfig;
}

export interface FormData {
  selectedOrganizations: number[];
  emails: string[];
  [key: string]: any;
}
