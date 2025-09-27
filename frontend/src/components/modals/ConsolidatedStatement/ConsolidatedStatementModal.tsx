import React from "react";
import ReportModal from "../../common/ReportModal/ReportModal";
import { ModalConfig } from "../../common/ReportModal/types";

const config: ModalConfig = {
  id: "consolidated-statement",
  title: "Сводная расчетная ведомость",
  colorScheme: "blue",
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
};

interface ConsolidatedStatementModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportTitle: string;
}

const ConsolidatedStatementModal: React.FC<ConsolidatedStatementModalProps> = (
  props
) => {
  return <ReportModal {...props} config={config} />;
};

export default ConsolidatedStatementModal;
