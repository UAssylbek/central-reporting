import React from "react";
import ReportModal from "../../common/ReportModal/ReportModal";
import { ModalConfig } from "../../common/ReportModal/types";
import { REPORT_OPTIONS } from "../../common/ReportModal/reportOptions";

const emptyConfig: ModalConfig = {
  id: "empty-report-selection",
  title: "Создание запроса отчета",
  colorScheme: "blue",
  startStep: 1, // Начинаем с первого шага - выбор отчёта
  reportOptions: REPORT_OPTIONS,
  defaultReportId: "", // Пустое значение - ничего не выбрано
  steps: [], // Шаги будут добавлены после выбора отчёта
};

interface EmptyReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EmptyReportModal: React.FC<EmptyReportModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [currentConfig, setCurrentConfig] =
    React.useState<ModalConfig>(emptyConfig);

  const handleReportChange = (newReportId: string) => {
    // Здесь будем загружать конфигурацию выбранного отчёта
    // Импортируем функцию из configLoader
    import("./configLoader").then(({ getAllReportConfigs }) => {
      const allConfigs = getAllReportConfigs();
      const selectedConfig = allConfigs[newReportId];

      if (selectedConfig) {
        // Обновляем конфигурацию, но сохраняем startStep = 1
        setCurrentConfig({
          ...selectedConfig,
          startStep: 1,
          defaultReportId: newReportId,
        });
      }
    });
  };

  // Сброс при закрытии
  React.useEffect(() => {
    if (!isOpen) {
      setCurrentConfig(emptyConfig);
    }
  }, [isOpen]);

  return (
    <ReportModal
      isOpen={isOpen}
      onClose={onClose}
      reportTitle="Создание запроса отчета"
      config={currentConfig}
      onReportChange={handleReportChange}
    />
  );
};

export default EmptyReportModal;
