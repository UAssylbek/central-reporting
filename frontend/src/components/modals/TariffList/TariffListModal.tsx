import React from "react";
import ReportModal from "../../common/ReportModal/ReportModal";
import { ModalConfig } from "../../common/ReportModal/types";

const config: ModalConfig = {
  id: "tariff-list",
  title: "Сводный тарификационный список",
  colorScheme: "blue",
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
};

interface TariffListModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportTitle: string;
}

const TariffListModal: React.FC<TariffListModalProps> = (props) => {
  return <ReportModal {...props} config={config} />;
};

export default TariffListModal;
