import React from "react";
import ReportModal from "../../common/ReportModal/ReportModal";
import { ModalConfig } from "../../common/ReportModal/types";

const config: ModalConfig = {
  id: "employee-list",
  title: "Сводный список работников организации",
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

interface EmployeeListModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportTitle: string;
}

const EmployeeListModal: React.FC<EmployeeListModalProps> = (props) => {
  return <ReportModal {...props} config={config} />;
};

export default EmployeeListModal;
