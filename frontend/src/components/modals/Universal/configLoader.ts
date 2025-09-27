import { ModalConfig, SearchOption } from "../../common/ReportModal/types";
import { REPORT_OPTIONS } from "../../common/ReportModal/reportOptions";

// Функция загрузки администраторов для ExpenseReport
const loadBudgetAdmins = async (): Promise<SearchOption[]> => {
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

// Все конфигурации отчетов
export const getAllReportConfigs = (): Record<string, ModalConfig> => {
  return {
    "consolidated-statement": {
      id: "consolidated-statement",
      title: "Сводная расчетная ведомость",
      colorScheme: "blue",
      startStep: 2,
      reportOptions: REPORT_OPTIONS,
      defaultReportId: "consolidated-statement",
      steps: [
        {
          title: "Параметры отчета",
          description: "Заполните параметры отчета",
          fields: [
            {
              name: "registrationPeriod",
              label: "Период регистрации",
              type: "month",
              required: true,
            },
            {
              name: "byExpenseClassification",
              label: "По классификации расходов",
              type: "radio",
              options: [
                { value: "yes", label: "Да" },
                { value: "no", label: "Нет" },
              ],
              required: true,
            },
          ],
        },
      ],
    },

    "tariff-list": {
      id: "tariff-list",
      title: "Сводный тарификационный список",
      colorScheme: "blue",
      startStep: 2,
      reportOptions: REPORT_OPTIONS,
      defaultReportId: "tariff-list",
      steps: [
        {
          title: "Параметры отчета",
          description: "Заполните параметры отчета",
          fields: [
            {
              name: "reportVariant",
              label: "Вариант отчета",
              type: "select",
              options: [
                "Общий",
                "Административно-управленческий персонал",
                "Административно-хозяйственный персонал",
                "Педагогические работники",
                "Хозяйственный персонал",
              ],
              required: true,
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
              options: [
                { value: "yes", label: "Да" },
                { value: "no", label: "Нет" },
              ],
              required: true,
            },
          ],
        },
      ],
    },

    "os-balance": {
      id: "os-balance",
      title: "Сводная ведомость остатков ОС",
      colorScheme: "blue",
      startStep: 2,
      reportOptions: REPORT_OPTIONS,
      defaultReportId: "os-balance",
      steps: [
        {
          title: "Параметры отчета",
          description: "Заполните параметры отчета",
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
              validation: (value: string, formData: any) => {
                if (!value || !formData.startPeriod) return true;
                return new Date(value) >= new Date(formData.startPeriod);
              },
            },
          ],
        },
      ],
    },

    "long-term-search": {
      id: "long-term-search",
      title: "Поиск долгосрочных активов",
      colorScheme: "blue",
      startStep: 2,
      reportOptions: REPORT_OPTIONS,
      defaultReportId: "long-term-search",
      steps: [
        {
          title: "Параметры отчета",
          description: "Заполните параметры отчета",
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
              validation: (value: string, formData: any) => {
                if (!value || !formData.startPeriod) return true;
                return new Date(value) >= new Date(formData.startPeriod);
              },
            },
            {
              name: "searchMethod",
              label: "Способ поиска",
              type: "radio",
              options: [
                { value: "contains", label: "Содержит" },
                { value: "equals", label: "Равно" },
              ],
              required: true,
            },
            {
              name: "searchText",
              label: "Текст для поиска",
              type: "text",
              required: true,
              placeholder: "Введите текст для поиска",
            },
          ],
        },
      ],
    },

    "tmz-balance": {
      id: "tmz-balance",
      title: "Сводная ведомость остатков ТМЗ",
      colorScheme: "blue",
      startStep: 2,
      reportOptions: REPORT_OPTIONS,
      defaultReportId: "tmz-balance",
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
          ],
        },
      ],
    },

    "expense-report": {
      id: "expense-report",
      title: "Отчет по расходам по форме 4-20",
      colorScheme: "blue",
      startStep: 2,
      reportOptions: REPORT_OPTIONS,
      defaultReportId: "expense-report",
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
    },

    "cash-flow-report": {
      id: "cash-flow-report",
      title: "Сводный отчет об исполнении денежных средств",
      colorScheme: "blue",
      startStep: 2,
      reportOptions: REPORT_OPTIONS,
      defaultReportId: "cash-flow-report",
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
          ],
        },
      ],
    },

    "employee-list": {
      id: "employee-list",
      title: "Сводный список работников организации",
      colorScheme: "blue",
      startStep: 2,
      reportOptions: REPORT_OPTIONS,
      defaultReportId: "employee-list",
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
          ],
        },
      ],
    },

    "debt-report": {
      id: "debt-report",
      title: "Сводный отчет по дебиторской и кредиторской задолженности",
      colorScheme: "blue",
      startStep: 2,
      reportOptions: REPORT_OPTIONS,
      defaultReportId: "debt-report",
      steps: [
        {
          title: "Параметры отчета",
          description: "Заполните параметры отчета",
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
              validation: (value: string, formData: any) => {
                if (!value || !formData.startPeriod) return true;
                return new Date(value) >= new Date(formData.startPeriod);
              },
            },
          ],
        },
      ],
    },
  };
};
