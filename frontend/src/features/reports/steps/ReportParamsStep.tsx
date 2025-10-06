// frontend/src/features/reports/steps/ReportParamsStep.tsx
import { Input } from "../../../shared/ui/Input/Input";
import type { ReportStepConfig, ReportFieldConfig } from "../../../shared/types/reportConfig";

export interface ReportParamsStepProps {
  step: ReportStepConfig;
  formData: Record<string, any>;
  onChange: (field: string, value: any) => void;
  errors: Record<string, string>;
}

export function ReportParamsStep({
  step,
  formData,
  onChange,
  errors,
}: ReportParamsStepProps) {
  // ✅ ИСПРАВЛЕНО: типизировали параметр field
  const renderField = (field: ReportFieldConfig) => {
    const value = formData[field.name] || field.defaultValue || "";
    const error = errors[field.name];

    switch (field.type) {
      case "text":
      case "email":
      case "number":
        return (
          <Input
            key={field.name}
            label={field.label}
            type={field.type}
            value={value}
            onChange={(e) => onChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            error={error}
            helperText={field.description}
          />
        );

      case "date":
      case "month":
        return (
          <div key={field.name}>
            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type={field.type}
              value={value}
              onChange={(e) => onChange(field.name, e.target.value)}
              required={field.required}
              className="w-full px-4 py-2 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all"
            />
            {field.description && (
              <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">
                {field.description}
              </p>
            )}
            {error && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {error}
              </p>
            )}
          </div>
        );

      case "select":
        return (
          <div key={field.name}>
            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <select
              value={value}
              onChange={(e) => onChange(field.name, e.target.value)}
              required={field.required}
              className="w-full px-4 py-2 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all"
            >
              <option value="">Выберите...</option>
              {field.options?.map((option: any) => {
                const optValue = typeof option === "string" ? option : option.value;
                const optLabel = typeof option === "string" ? option : option.label;
                return (
                  <option key={optValue} value={optValue}>
                    {optLabel}
                  </option>
                );
              })}
            </select>
            {field.description && (
              <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">
                {field.description}
              </p>
            )}
            {error && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {error}
              </p>
            )}
          </div>
        );

      case "radio":
        return (
          <div key={field.name}>
            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="space-y-2">
              {field.options?.map((option: any) => {
                const optValue = typeof option === "string" ? option : option.value;
                const optLabel = typeof option === "string" ? option : option.label;
                return (
                  <label
                    key={optValue}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name={field.name}
                      value={optValue}
                      checked={value === optValue}
                      onChange={(e) => onChange(field.name, e.target.value)}
                      className="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-900 dark:text-white">
                      {optLabel}
                    </span>
                  </label>
                );
              })}
            </div>
            {field.description && (
              <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">
                {field.description}
              </p>
            )}
            {error && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {error}
              </p>
            )}
          </div>
        );

      case "checkbox":
        return (
          <label
            key={field.name}
            className="flex items-start gap-3 cursor-pointer"
          >
            <input
              type="checkbox"
              checked={!!value}
              onChange={(e) => onChange(field.name, e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex-1">
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {field.label}
              </span>
              {field.description && (
                <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
                  {field.description}
                </p>
              )}
            </div>
          </label>
        );

      case "textarea":
        return (
          <div key={field.name}>
            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <textarea
              value={value}
              onChange={(e) => onChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              required={field.required}
              rows={4}
              className="w-full px-4 py-2 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all resize-vertical"
            />
            {field.description && (
              <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">
                {field.description}
              </p>
            )}
            {error && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {error}
              </p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {step.title}
        </h3>
        <p className="text-sm text-gray-600 dark:text-zinc-400 mt-1">
          {step.description}
        </p>
      </div>

      <div className="space-y-4">
        {step.fields.map((field) => renderField(field))}
      </div>
    </div>
  );
}