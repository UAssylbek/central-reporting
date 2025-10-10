// frontend/src/features/reports/configs/cash-flow.config.ts
import type { ReportModalConfig } from "../../../shared/types/reportConfig";

export const cashFlowConfig: ReportModalConfig = {
  id: "cash_flow",
  title: "Сводный отчет об исполнении денежных средств",
  description:
    "Сводный отчет о движении денежных средств организаций за период",
  icon: "💳",
  colorScheme: "cyan",
  steps: [
    {
      id: "params",
      title: "Параметры отчета",
      description: "Заполните параметры для формирования отчёта",
      fields: [
        {
          name: "period",
          label: "Период",
          type: "date",
          required: true,
          description:
            "Выберите дату для формирования отчета о движении денежных средств",
        },
      ],
    },
  ],
};
