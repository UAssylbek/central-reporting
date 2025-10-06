// frontend/src/features/reports/configs/os-balance.config.ts
import type { ReportModalConfig } from "../../../shared/types/reportConfig";

export const osBalanceConfig: ReportModalConfig = {
  id: "os_balance",
  title: "Сводная ведомость остатков ОС",
  description: "Ведомость остатков долгосрочных активов",
  icon: "🏢",
  colorScheme: "green",
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
        },
        {
          name: "endPeriod",
          label: "Конец периода",
          type: "date",
          required: true,
          validation: (value: unknown, formData?: Record<string, unknown>) => {
            if (typeof value !== "string" || !formData?.startPeriod)
              return true;
            const startPeriod = formData.startPeriod;
            if (typeof startPeriod !== "string") return true;
            return new Date(value) >= new Date(startPeriod);
          },
        },
      ],
    },
  ],
};
