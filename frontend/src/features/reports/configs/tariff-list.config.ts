// frontend/src/features/reports/configs/tariff-list.config.ts
import type { ReportModalConfig } from "../../../shared/types/reportConfig";

export const tariffListConfig: ReportModalConfig = {
  id: "tariff_list",
  title: "Сводный тарификационный список",
  description: "Сводный отчет по тарификации работников",
  icon: "📋",
  colorScheme: "orange",
  steps: [
    {
      id: "params",
      title: "Параметры отчета",
      description: "Заполните параметры для формирования отчёта",
      fields: [
        {
          name: "reportVariant",
          label: "Вариант отчёта",
          type: "select",
          required: true,
          options: [
            "Общий",
            "Административно-управленческий персонал",
            "Административно-хозяйственный персонал",
            "Педагогические работники",
            "Хозяйственный персонал",
          ],
        },
        {
          name: "registrationPeriod",
          label: "Период регистрации",
          type: "month",
          required: true,
        },
        {
          name: "detailedByClasses",
          label: "Детальная по видам классов",
          type: "radio",
          required: true,
          options: [
            { value: "yes", label: "Да" },
            { value: "no", label: "Нет" },
          ],
        },
      ],
    },
  ],
};