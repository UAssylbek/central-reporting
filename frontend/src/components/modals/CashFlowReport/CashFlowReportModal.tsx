import React from "react";
import ReportModal from "../../common/ReportModal/ReportModal";
import { ModalConfig } from "../../common/ReportModal/types";

const config: ModalConfig = {
  id: "cash-flow-report",
  title: "Сводный отчет об исполнении денежных средств",
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

interface CashFlowReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportTitle: string;
}

const CashFlowReportModal: React.FC<CashFlowReportModalProps> = (props) => {
  return <ReportModal {...props} config={config} />;
};

export default CashFlowReportModal;
