import React from "react";
import ReportModal from "../../common/ReportModal/ReportModal";
import { ModalConfig } from "../../common/ReportModal/types";
import { REPORT_OPTIONS } from "../../common/ReportModal/reportOptions";

const config: ModalConfig = {
  id: "long-term-search",
  title: "Поиск долгосрочных активов",
  colorScheme: "blue",
  startStep: 2, // Начинаем с шага "Организации"
  reportOptions: REPORT_OPTIONS,
  defaultReportId: "long-term-search", // Дефолтно выбран этот отчет
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
};

interface LongTermSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportTitle: string;
}

const LongTermSearchModal: React.FC<LongTermSearchModalProps> = (props) => {
  return <ReportModal {...props} config={config} />;
};

export default LongTermSearchModal;
