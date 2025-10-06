// frontend/src/features/reports/configs/consolidated-statement.config.ts
import type { ReportModalConfig } from "../../../shared/types/reportConfig";

export const consolidatedStatementConfig: ReportModalConfig = {
  id: "consolidated_statement",
  title: "Сводная расчетная ведомость",
  description: 'Сводный отчет "Расчетная ведомость организации"',
  icon: "💰",
  colorScheme: "blue",
  steps: [
    {
      id: "params",
      title: "Параметры отчета",
      description: "Заполните параметры для формирования отчёта",
      fields: [
        {
          name: "registrationPeriod",
          label: "Период регистрации",
          type: "month",
          required: true,
          description: "Выберите месяц для формирования отчёта",
        },
        {
          name: "byExpenseClassification",
          label: "По классификации расходов",
          type: "radio",
          required: true,
          options: [
            { value: "yes", label: "Да" },
            { value: "no", label: "Нет" },
          ],
          description: "Группировать данные по классификации расходов",
        },
      ],
    },
  ],
};