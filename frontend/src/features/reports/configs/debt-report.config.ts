// frontend/src/features/reports/configs/debt-report.config.ts
import type { ReportModalConfig } from "../../../shared/types/reportConfig";

export const debtReportConfig: ReportModalConfig = {
  id: "debt_report",
  title: "Сводный отчет по дебиторской и кредиторской задолженности",
  description: "Анализ дебиторской и кредиторской задолженности организаций",
  icon: "📊",
  colorScheme: "yellow",
  steps: [
    {
      id: "params",
      title: "Параметры отчета",
      description: "Заполните параметры для формирования отчёта",
      fields: [
        {
          name: "startPeriod",
          label: "Начало периода",
          type: "date",
          required: true,
          description: "Выберите начальную дату периода анализа задолженности",
        },
        {
          name: "endPeriod",
          label: "Конец периода",
          type: "date",
          required: true,
          description: "Выберите конечную дату периода анализа задолженности",
          validation: (value: unknown, formData?: Record<string, unknown>) => {
            if (typeof value !== "string" || !formData?.startPeriod)
              return true;
            const startPeriod = formData.startPeriod;
            if (typeof startPeriod !== "string") return true;
            return new Date(value) >= new Date(startPeriod)
              ? true
              : "Конец периода должен быть больше или равен началу периода";
          },
        },
      ],
    },
  ],
};
