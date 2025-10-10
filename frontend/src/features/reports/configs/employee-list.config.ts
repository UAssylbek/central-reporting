// frontend/src/features/reports/configs/employee-list.config.ts
import type { ReportModalConfig } from "../../../shared/types/reportConfig";

export const employeeListConfig: ReportModalConfig = {
  id: "employee_list",
  title: "Сводный список работников организации",
  description: "Отчет предоставляет полный реестр сотрудников всех организаций",
  icon: "👥",
  colorScheme: "pink",
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
          description: "Выберите дату для формирования списка работников",
        },
      ],
    },
  ],
};
