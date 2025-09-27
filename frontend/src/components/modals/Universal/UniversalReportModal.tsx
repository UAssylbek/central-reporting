import React, { useState, useEffect, useMemo } from "react";
import ReportModal from "../../common/ReportModal/ReportModal";
import { ModalConfig } from "../../common/ReportModal/types";
import { getAllReportConfigs } from "./configLoader";

interface UniversalReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportTitle: string;
  initialReportId: string; // ID отчета, с которого начинаем
}

const UniversalReportModal: React.FC<UniversalReportModalProps> = ({
  isOpen,
  onClose,
  reportTitle,
  initialReportId,
}) => {
  // Мемоизируем конфигурации чтобы избежать пересоздания
  const allConfigs = useMemo(() => getAllReportConfigs(), []);

  const [currentConfig, setCurrentConfig] = useState<ModalConfig | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(2); // Сброс на шаг 2 при смене отчета

  useEffect(() => {
    // Устанавливаем начальную конфигурацию только один раз
    const initialConfig = allConfigs[initialReportId];
    if (initialConfig && !currentConfig) {
      setCurrentConfig(initialConfig);
    }
  }, [initialReportId, allConfigs, currentConfig]);

  // Обработчик изменения отчета на первой странице
  const handleReportChange = (newReportId: string) => {
    const newConfig = allConfigs[newReportId];
    if (newConfig && newConfig.id !== currentConfig?.id) {
      // Создаем новую конфигурацию с обновленным defaultReportId
      const updatedConfig = {
        ...newConfig,
        defaultReportId: newReportId,
        startStep: 2, // Сбрасываем на шаг организаций
      };
      setCurrentConfig(updatedConfig);
      setCurrentStep(2); // Принудительно переходим на шаг организаций
    }
  };

  // Обработчик закрытия с очисткой состояния
  const handleClose = () => {
    setCurrentConfig(null);
    setCurrentStep(2);
    onClose();
  };

  if (!currentConfig) {
    return null;
  }

  return (
    <ReportModal
      isOpen={isOpen}
      onClose={handleClose}
      reportTitle={currentConfig.title}
      config={currentConfig}
      onReportChange={handleReportChange}
    />
  );
};

export default UniversalReportModal;
