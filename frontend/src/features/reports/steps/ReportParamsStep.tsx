// frontend/src/features/reports/steps/ReportParamsStep.tsx
import { Input } from "../../../shared/ui/Input/Input";
import { SearchField } from "../../../shared/ui/SearchField/SearchField";
import type { ReportStepConfig } from "../../../shared/types/reportConfig";

export interface ReportParamsStepProps {
  step: ReportStepConfig;
  formData: Record<string, unknown>;
  onChange: (field: string, value: unknown) => void;
  errors?: Record<string, string>;
}

export function ReportParamsStep({
  step,
  formData,
  onChange,
  errors = {},
}: ReportParamsStepProps) {
  return (
    <div className="space-y-6">
      {/* Step Description */}
      {step.description && (
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            {step.description}
          </p>
        </div>
      )}

      {/* Fields */}
      <div className="space-y-4">
        {step.fields.map((field) => {
          const value = formData[field.name];
          const error = errors[field.name];

          // Search field (NEW!)
          if (field.type === "search" && field.searchConfig) {
            return (
              <SearchField
                key={field.name}
                label={field.label}
                value={typeof value === "string" ? value : ""}
                onChange={(newValue, selectedId) => {
                  onChange(field.name, newValue);
                  if (selectedId !== undefined) {
                    onChange(`${field.name}_id`, selectedId);
                  }
                }}
                searchConfig={field.searchConfig}
                required={field.required}
                error={error}
                description={field.description}
              />
            );
          }

          // Text field
          if (field.type === "text") {
            return (
              <div key={field.name} className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {field.label}
                  {field.required && (
                    <span className="ml-1 text-red-500">*</span>
                  )}
                </label>
                <Input
                  type="text"
                  value={typeof value === "string" ? value : ""}
                  onChange={(e) => onChange(field.name, e.target.value)}
                  placeholder={field.placeholder}
                  error={error}
                />
                {field.description && !error && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {field.description}
                  </p>
                )}
              </div>
            );
          }

          // Date field
          if (field.type === "date") {
            return (
              <div key={field.name} className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {field.label}
                  {field.required && (
                    <span className="ml-1 text-red-500">*</span>
                  )}
                </label>
                <Input
                  type="date"
                  value={typeof value === "string" ? value : ""}
                  onChange={(e) => onChange(field.name, e.target.value)}
                  error={error}
                />
                {field.description && !error && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {field.description}
                  </p>
                )}
              </div>
            );
          }

          // Month field
          if (field.type === "month") {
            return (
              <div key={field.name} className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {field.label}
                  {field.required && (
                    <span className="ml-1 text-red-500">*</span>
                  )}
                </label>
                <Input
                  type="month"
                  value={typeof value === "string" ? value : ""}
                  onChange={(e) => onChange(field.name, e.target.value)}
                  error={error}
                />
                {field.description && !error && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {field.description}
                  </p>
                )}
              </div>
            );
          }

          // Select field
          if (field.type === "select") {
            return (
              <div key={field.name} className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {field.label}
                  {field.required && (
                    <span className="ml-1 text-red-500">*</span>
                  )}
                </label>
                <select
                  value={typeof value === "string" ? value : ""}
                  onChange={(e) => onChange(field.name, e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-zinc-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:border-transparent ${
                    error
                      ? "border-red-300 dark:border-red-600 focus:ring-red-500"
                      : "border-gray-300 dark:border-zinc-600 focus:ring-blue-500 dark:focus:ring-blue-600"
                  }`}
                >
                  <option value="">Выберите {field.label.toLowerCase()}</option>
                  {field.options?.map((option) => {
                    const optionValue =
                      typeof option === "string" ? option : option.value;
                    const optionLabel =
                      typeof option === "string" ? option : option.label;
                    return (
                      <option key={optionValue} value={optionValue}>
                        {optionLabel}
                      </option>
                    );
                  })}
                </select>
                {error && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {error}
                  </p>
                )}
                {field.description && !error && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {field.description}
                  </p>
                )}
              </div>
            );
          }

          // Radio field
          if (field.type === "radio") {
            return (
              <div key={field.name} className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {field.label}
                  {field.required && (
                    <span className="ml-1 text-red-500">*</span>
                  )}
                </label>
                <div className="space-y-2">
                  {field.options?.map((option) => {
                    const optionValue =
                      typeof option === "string" ? option : option.value;
                    const optionLabel =
                      typeof option === "string" ? option : option.label;
                    return (
                      <label
                        key={optionValue}
                        className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-800 cursor-pointer transition-colors"
                      >
                        <input
                          type="radio"
                          name={field.name}
                          value={optionValue}
                          checked={value === optionValue}
                          onChange={(e) => onChange(field.name, e.target.value)}
                          className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-900 dark:text-white">
                          {optionLabel}
                        </span>
                      </label>
                    );
                  })}
                </div>
                {error && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {error}
                  </p>
                )}
                {field.description && !error && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {field.description}
                  </p>
                )}
              </div>
            );
          }

          return null;
        })}
      </div>
    </div>
  );
}
