import React from "react";
import ReportModal from "../../common/ReportModal/ReportModal";
import { ModalConfig } from "../../common/ReportModal/types";
import { REPORT_OPTIONS } from "../../common/ReportModal/reportOptions";

const config: ModalConfig = {
  id: "tmz-balance",
  title: "Сводная ведомость остатков ТМЗ",
  colorScheme: "blue",
  startStep: 2, // Начинаем с шага "Организации"
  reportOptions: REPORT_OPTIONS,
  defaultReportId: "tmz-balance", // Дефолтно выбран этот отчет
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
};

interface TMZBalanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportTitle: string;
}

const TMZBalanceModal: React.FC<TMZBalanceModalProps> = (props) => {
  return <ReportModal {...props} config={config} />;
};

export default TMZBalanceModal;
