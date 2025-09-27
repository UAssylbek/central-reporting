import React from "react";
import ReportModal from "../../common/ReportModal/ReportModal";
import { ModalConfig } from "../../common/ReportModal/types";

const config: ModalConfig = {
  id: "tmz-balance",
  title: "Сводная ведомость остатков ТМЗ",
  colorScheme: "blue",
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
