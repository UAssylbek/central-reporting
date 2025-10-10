// frontend/src/features/reports/configs/tmz-balance.config.ts
import type { ReportModalConfig } from "../../../shared/types/reportConfig";

export const tmzBalanceConfig: ReportModalConfig = {
  id: "tmz_balance",
  title: "Сводная ведомость остатков ТМЗ",
  description:
    "Ведомость остатков товарно-материальных запасов по данным бухгалтерского учета",
  icon: "📦",
  colorScheme: "indigo",
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
          description: "Выберите дату для формирования отчета по остаткам ТМЗ",
        },
      ],
    },
  ],
};
