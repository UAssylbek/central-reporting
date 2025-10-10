// frontend/src/features/reports/configs/long-term-search.config.ts
import type { ReportModalConfig } from "../../../shared/types/reportConfig";

export const longTermSearchConfig: ReportModalConfig = {
  id: "long_term_search",
  title: "Поиск долгосрочных активов",
  description: "Отчет осуществляет поиск долгосрочных активов по организациям",
  icon: "🔍",
  colorScheme: "purple",
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
          description: "Выберите начальную дату периода поиска",
        },
        {
          name: "endPeriod",
          label: "Конец периода",
          type: "date",
          required: true,
          description: "Выберите конечную дату периода поиска",
          validation: (value: unknown, formData?: Record<string, unknown>) => {
            if (typeof value !== "string" || !formData?.startPeriod)
              return true;
            const startPeriod = formData.startPeriod;
            if (typeof startPeriod !== "string") return true;
            return new Date(value) >= new Date(startPeriod)
              ? true
              : "Конец периода должен быть больше или равен началу периода";
          },
        },
        {
          name: "searchMethod",
          label: "Способ поиска",
          type: "radio",
          required: true,
          options: [
            { value: "contains", label: "Содержит" },
            { value: "equals", label: "Равно" },
          ],
          defaultValue: "contains",
          description: "Выберите способ поиска по наименованию актива",
        },
        {
          name: "searchText",
          label: "Текст для поиска",
          type: "text",
          required: true,
          placeholder: "Введите текст для поиска",
          description:
            "Наименование или часть наименования долгосрочного актива",
        },
      ],
    },
  ],
};
