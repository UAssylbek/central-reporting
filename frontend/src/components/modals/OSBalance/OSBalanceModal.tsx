import React from "react";
import ReportModal from "../../common/ReportModal/ReportModal";
import { ModalConfig } from "../../common/ReportModal/types";

const config: ModalConfig = {
  id: "os-balance",
  title: "Сводная ведомость остатков ОС",
  colorScheme: "blue",
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
};

interface OSBalanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportTitle: string;
}

const OSBalanceModal: React.FC<OSBalanceModalProps> = (props) => {
  return <ReportModal {...props} config={config} />;
};

export default OSBalanceModal;
