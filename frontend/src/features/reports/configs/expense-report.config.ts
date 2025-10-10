// frontend/src/features/reports/configs/expense-report.config.ts
import type { ReportModalConfig } from "../../../shared/types/reportConfig";
import type { SearchOption } from "../../../shared/types/reportConfig";

// Функция загрузки администраторов (в реальном проекте это будет API запрос)
const loadBudgetAdmins = async (): Promise<SearchOption[]> => {
  // Имитация загрузки данных с сервера
  await new Promise((resolve) => setTimeout(resolve, 500));

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
      description:
        "Администратор бюджетных программ - Планово-экономический отдел",
    },
    {
      id: 4,
      name: "Козлова Мария Александровна",
      description: "Администратор бюджетных программ - Финансовое управление",
    },
    {
      id: 5,
      name: "Морозов Дмитрий Николаевич",
      description: "Администратор бюджетных программ - Бюджетный отдел",
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
          type: "search",
          required: true,
          description: "Выберите администратора бюджетных программ",
          searchConfig: {
            modalTitle: "Администраторы бюджетных программ",
            searchPlaceholder: "Введите имя администратора для поиска...",
            noResultsText: "Администраторы не найдены",
            loadOptions: loadBudgetAdmins,
          },
        },
      ],
    },
  ],
};
