// frontend/src/features/reports/steps/ConfirmationStep.tsx
import type { ReportModalConfig } from "../../../shared/types/reportConfig";

interface ReportFormData {
  [key: string]: unknown;
  emailNotification?: boolean;
  recipients?: string[];
}

export interface ConfirmationStepProps {
  reportTitle: string;
  config: ReportModalConfig;
  formData: ReportFormData;
  organizationCount: number;
}

export function ConfirmationStep({
  reportTitle,
  config,
  formData,
  organizationCount,
}: ConfirmationStepProps) {
  return (
    <div className="space-y-6">
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <svg
            className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div>
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
              Подтверждение создания запроса
            </h3>
            <p className="text-sm text-blue-800 dark:text-blue-200">
              Ввод параметров завершен. Нажмите "Создать запрос" для завершения
              работы помощника.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-800 rounded-lg border border-gray-200 dark:border-zinc-700 p-6 space-y-4">
        <div>
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Запрашиваемый отчет: {reportTitle}
          </h4>
        </div>

        <div className="space-y-3">
          <div className="flex items-start gap-2">
            <span className="font-medium text-gray-700 dark:text-zinc-300 min-w-[180px]">
              Выбрано организаций:
            </span>
            <span className="text-gray-900 dark:text-white">
              {organizationCount}
            </span>
          </div>

          {config.steps
            .flatMap((step) => step.fields)
            .map((field) => {
              const value = formData[field.name];
              if (!value) return null;

              return (
                <div key={field.name} className="flex items-start gap-2">
                  <span className="font-medium text-gray-700 dark:text-zinc-300 min-w-[180px]">
                    {field.label}:
                  </span>
                  <span className="text-gray-900 dark:text-white">
                    {typeof value === "boolean"
                      ? value
                        ? "Да"
                        : "Нет"
                      : typeof value === "string" || typeof value === "number"
                      ? value
                      : JSON.stringify(value)}
                  </span>
                </div>
              );
            })}

          {formData.emailNotification && (
            <div className="flex items-start gap-2">
              <span className="font-medium text-gray-700 dark:text-zinc-300 min-w-[180px]">
                Email уведомления:
              </span>
              <span className="text-gray-900 dark:text-white">Включены</span>
            </div>
          )}

          {formData.recipients && formData.recipients.length > 0 && (
            <div className="flex items-start gap-2">
              <span className="font-medium text-gray-700 dark:text-zinc-300 min-w-[180px]">
                Получатели:
              </span>
              <div className="flex-1">
                <div className="flex flex-wrap gap-2">
                  {formData.recipients.map((email: string, index: number) => (
                    <span
                      key={index}
                      className="inline-block px-2 py-1 bg-gray-100 dark:bg-zinc-700 text-sm text-gray-700 dark:text-zinc-300 rounded"
                    >
                      {email}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700 rounded-lg p-4">
        <p className="text-sm text-gray-600 dark:text-zinc-400">
          <span className="font-medium text-gray-900 dark:text-white">
            Обратите внимание:
          </span>{" "}
          Запрос будет помещен в очередь выполнения. После формирования отчет
          будет автоматически отправлен по указанным адресам электронной почты.
        </p>
      </div>
    </div>
  );
}
