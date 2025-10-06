// frontend/src/features/reports/configs/expense-report.config.ts
import type { ReportModalConfig } from "../../../shared/types/reportConfig";

export const expenseReportConfig: ReportModalConfig = {
  id: "expense_report",
  title: "Отчет по расходам по форме 4-20",
  description: "Отчет предоставляет данные плана финансирования",
  icon: "💸",
  colorScheme: "red",
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
        },
        {
          name: "budgetAdmin",
          label: "Администратор бюджетных программ",
          type: "text", // Будет отображаться как поле с кнопкой поиска
          required: true,
          description: "Выберите администратора бюджетных программ",
          // Добавляем метаданные для поиска
          validation: (value: unknown) => {
            return !!value && typeof value === "string" && value.trim() !== "";
          },
        },
      ],
    },
  ],
};
