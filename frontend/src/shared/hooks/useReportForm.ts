// frontend/src/shared/hooks/useReportForm.ts
import { useState, useCallback } from "react";
import type { ReportFormData } from "../types/reportConfig";
import type { ReportType } from "../types/reports";

export interface UseReportFormReturn {
  formData: ReportFormData;
  updateField: (field: string, value: any) => void;
  updateFields: (fields: Partial<ReportFormData>) => void;
  resetForm: (reportType: ReportType) => void;
  isValid: boolean;
  errors: Record<string, string>;
  setErrors: (errors: Record<string, string>) => void;
}

const getInitialFormData = (reportType: ReportType): ReportFormData => ({
  reportType,
  organizationIds: [],
  emailNotification: false,
  recipients: [],
});

export function useReportForm(initialReportType: ReportType): UseReportFormReturn {
  const [formData, setFormData] = useState<ReportFormData>(
    getInitialFormData(initialReportType)
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateField = useCallback((field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Очищаем ошибку при изменении поля
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  const updateFields = useCallback((fields: Partial<ReportFormData>) => {
    setFormData((prev) => ({
      ...prev,
      ...fields,
    }));
  }, []);

  const resetForm = useCallback((reportType: ReportType) => {
    setFormData(getInitialFormData(reportType));
    setErrors({});
  }, []);

  const isValid = Object.keys(errors).length === 0;

  return {
    formData,
    updateField,
    updateFields,
    resetForm,
    isValid,
    errors,
    setErrors,
  };
}