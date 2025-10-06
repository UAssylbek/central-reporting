// frontend/src/features/reports/configs/expense-report.config.ts
import type { ReportModalConfig } from "../../../shared/types/reportConfig";

// Типы для поиска
interface SearchOption {
  id: number | string;
  name: string;
  description?: string;
}

// Функция загрузки администраторов (в реальном проекте это будет API)
const loadBudgetAdmins = async (): Promise<SearchOption[]> => {
  // Имитация загрузки
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return [
    {
      id: 1,
      name: "Иванов Иван Иванович",
      description: "Администратор бюджетных программ - Отдел финансов",
    },
    {
      id: 2,
      name: "Петрова Елена Сергеевна",
      description: "Администратор бюджетных программ - Отдел экономики",
    },
    {
      id: 3,
      name: "Сидоров Алексей Михайлович",
      description: "Администратор бюджетных программ - Планово-экономический отдел",
    },
    {
      id: 4,
      name: "Козлова Мария Александровна",
      description: "Администратор бюджетных программ - Финансовое управление",
    },
  ];
};

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
          validation: (value: any) => {
            return !!value && value.trim() !== "";
          },
        },
      ],
    },
  ],
};