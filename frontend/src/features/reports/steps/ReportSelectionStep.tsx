// frontend/src/features/reports/steps/ReportSelectionStep.tsx
import type { ReportType } from "../../../shared/types/reports";
import { REPORTS_LIST } from "../../../shared/config/reportsList";

export interface ReportSelectionStepProps {
  selectedReport: ReportType;
  onChange: (reportType: ReportType) => void;
}

export function ReportSelectionStep({
  selectedReport,
  onChange,
}: ReportSelectionStepProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Выберите тип отчёта
        </h3>
        <p className="text-sm text-gray-600 dark:text-zinc-400">
          Выберите отчёт из списка доступных
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {REPORTS_LIST.map((report) => (
          <button
            key={report.id}
            onClick={() => onChange(report.id as ReportType)}
            className={`
              p-4 rounded-lg border-2 text-left transition-all cursor-pointer
              ${
                selectedReport === report.id
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                  : "border-gray-200 dark:border-zinc-700 hover:border-blue-300 dark:hover:border-blue-700"
              }
            `}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">{report.icon}</span>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                  {report.title}
                </h4>
                <p className="text-sm text-gray-600 dark:text-zinc-400">
                  {report.description}
                </p>
                {report.category && (
                  <span className="inline-block mt-2 px-2 py-1 text-xs bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 rounded">
                    {report.category}
                  </span>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>

      {!selectedReport && (
        <p className="text-sm text-amber-600 dark:text-amber-400 mt-2">
          ⚠️ Выберите отчёт для продолжения
        </p>
      )}
    </div>
  );
}
