import React from "react";
import ReportModal from "../../common/ReportModal/ReportModal";
import { ModalConfig, SearchOption } from "../../common/ReportModal/types";
import { REPORT_OPTIONS } from "../../common/ReportModal/reportOptions";

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
    {
      id: 6,
      name: "Новикова Анна Владимировна",
      description: "Администратор бюджетных программ - Управление финансов",
    },
    {
      id: 7,
      name: "Федоров Сергей Петрович",
      description: "Администратор бюджетных программ - Казначейство",
    },
    {
      id: 8,
      name: "Белова Ольга Игоревна",
      description:
        "Администратор бюджетных программ - Контрольно-ревизионный отдел",
    },
  ];
};

const config: ModalConfig = {
  id: "expense-report",
  title: "Отчет по расходам по форме 4-20",
  colorScheme: "blue",
  startStep: 2, // Начинаем с шага "Организации"
  reportOptions: REPORT_OPTIONS,
  defaultReportId: "expense-report", // Дефолтно выбран этот отчет
  steps: [
    {
      title: "Параметры отчета",
      description: "Заполните параметры отчета",
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

interface ExpenseReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportTitle: string;
}

const ExpenseReportModal: React.FC<ExpenseReportModalProps> = (props) => {
  return <ReportModal {...props} config={config} />;
};

export default ExpenseReportModal;
