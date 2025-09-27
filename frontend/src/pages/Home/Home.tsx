import React, { useState, Suspense, lazy } from "react";
import "./Home.css";

const readyModals = [
  "consolidated-statement",
  "tariff-list",
  "os-balance",
  "long-term-search",
  "tmz-balance",
  "cash-flow-report",
  "employee-list",
  "debt-report",
  "expense-report",
];

// Новый импорт для универсального модального окна
const UniversalReportModal = lazy(
  () => import("../../components/modals/Universal/UniversalReportModal")
);

// Временная заглушка для остальных модальных окон
const TemporaryModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  reportTitle: string;
}> = ({ isOpen, onClose, reportTitle }) => {
  if (!isOpen) return null;

  return (
    <div className="modalOverlayBackdrop_7k3m9" onClick={onClose}>
      <div
        className="modalContentDialog_4q8r2"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modalHeaderSection_6w5t1">
          <h3>{reportTitle}</h3>
          <button className="modalCloseButton_3s9f4" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="modalBodyContent_8u7y5">
          <div style={{ padding: "20px", textAlign: "center" }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>🚧</div>
            <h4 style={{ marginBottom: "12px", color: "#374151" }}>
              Модальное окно в разработке
            </h4>
            <p style={{ color: "#6b7280", marginBottom: "20px" }}>
              Это временная заглушка. Скоро здесь будет полнофункциональная
              форма для создания отчета "{reportTitle}".
            </p>
            <div
              style={{
                background: "#f3f4f6",
                padding: "12px",
                borderRadius: "6px",
                fontSize: "14px",
                color: "#374151",
              }}
            >
              <strong>Планируемые функции:</strong>
              <ul
                style={{
                  textAlign: "left",
                  margin: "8px 0 0 0",
                  paddingLeft: "20px",
                }}
              >
                <li>Пошаговый мастер настройки отчета</li>
                <li>Выбор организаций и периодов</li>
                <li>Настройка параметров вывода</li>
                <li>Предварительный просмотр</li>
                <li>Отправка по электронной почте</li>
              </ul>
            </div>
          </div>
          <div
            style={{
              padding: "16px",
              borderTop: "1px solid #e5e7eb",
              display: "flex",
              justifyContent: "flex-end",
              gap: "12px",
            }}
          >
            <button
              onClick={onClose}
              style={{
                padding: "8px 16px",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                background: "white",
                cursor: "pointer",
              }}
            >
              Закрыть
            </button>
            <button
              onClick={() => {
                alert(`Будет создан отчет: ${reportTitle}`);
                onClose();
              }}
              style={{
                padding: "8px 16px",
                border: "none",
                borderRadius: "6px",
                background: "#3b82f6",
                color: "white",
                cursor: "pointer",
              }}
            >
              Создать отчет (заглушка)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Компонент загрузки для Suspense
const ModalLoadingSpinner: React.FC = () => (
  <div className="modalOverlayBackdrop_7k3m9">
    <div className="modalContentDialog_4q8r2">
      <div style={{ padding: "40px", textAlign: "center" }}>
        <div
          style={{
            width: "24px",
            height: "24px",
            border: "2px solid #f3f3f3",
            borderTop: "2px solid #3b82f6",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
            margin: "0 auto 16px",
          }}
        ></div>
        <p>Загрузка модального окна...</p>
      </div>
    </div>
  </div>
);

interface ReportConfig {
  id: string;
  title: string;
  icon: string;
  category: string;
  description?: string;
}

const Home: React.FC = () => {
  const [selectedModal, setSelectedModal] = useState<string | null>(null);

  // Конфигурация всех доступных отчетов
  const availableReports: ReportConfig[] = [
    {
      id: "consolidated-statement",
      title: "Сводная расчетная ведомость",
      icon: "💰",
      category: "Зарплата и кадры",
      description: "Сводный отчет по заработной плате всех организаций",
    },
    {
      id: "tariff-list",
      title: "Сводный тарификационный список",
      icon: "📋",
      category: "Зарплата и кадры",
      description: "Список тарифных ставок и должностных окладов",
    },
    {
      id: "os-balance",
      title: "Сводная ведомость остатков ОС",
      icon: "🏢",
      category: "Долгосрочные активы",
      description: "Отчет по остаткам основных средств",
    },
    {
      id: "long-term-search",
      title: "Поиск долгосрочных активов",
      icon: "🔍",
      category: "Долгосрочные активы",
      description: "Поиск и анализ долгосрочных активов организаций",
    },
    {
      id: "tmz-balance",
      title: "Сводная ведомость остатков ТМЗ",
      icon: "📦",
      category: "Номенклатура и склад",
      description: "Отчет по товарно-материальным запасам",
    },
    {
      id: "expense-report",
      title: "Отчет по расходам по форме 4-20",
      icon: "💸",
      category: "Банк и касса",
      description: "Отчет о расходах по установленной форме 4-20",
    },
    {
      id: "cash-flow-report",
      title: "Сводный отчет об исполнении денежных средств",
      icon: "💳",
      category: "Банк и касса",
      description: "Отчет о движении денежных средств организаций",
    },
    {
      id: "employee-list",
      title: "Сводный список работников организации",
      icon: "👥",
      category: "Зарплата и кадры",
      description: "Полный список сотрудников всех организаций",
    },
    {
      id: "debt-report",
      title: "Сводный отчет по дебиторской и кредиторской задолженности",
      icon: "📊",
      category: "Банк и касса",
      description: "Анализ задолженностей организаций",
    },
  ];

  const openModal = (modalId: string) => {
    setSelectedModal(modalId);
  };

  const closeModal = () => {
    setSelectedModal(null);
  };

  const getSelectedReport = () => {
    return availableReports.find((r) => r.id === selectedModal);
  };

  // Рендер соответствующего модального окна
  const renderModal = () => {
    if (!selectedModal) return null;

    const selectedReport = getSelectedReport();
    if (!selectedReport) return null;

    // Теперь все модальные окна используют UniversalReportModal
    return (
      <Suspense fallback={<ModalLoadingSpinner />}>
        <UniversalReportModal
          key={selectedModal} // Добавляем key для принудительного перерендера
          isOpen={true}
          onClose={closeModal}
          reportTitle={selectedReport.title}
          initialReportId={selectedModal}
        />
      </Suspense>
    );
  };

  // Группировка отчетов по категориям
  const reportsByCategory = availableReports.reduce((acc, report) => {
    const category = report.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(report);
    return acc;
  }, {} as Record<string, ReportConfig[]>);

  return (
    <div className="homePageMainWrapper_2k9x7">
      <h1>Начальная страница</h1>

      <div className="homeContentLayout_8m4n2">
        <div className="organizationSection_7p3q1">
          <h2>Доступные организации</h2>
          <div className="organizationsPanelContainer_9r5w8">
            <p className="emptyStatePlaceholder_3z6y2">
              Организации будут загружены из API
            </p>
          </div>
        </div>

        <div className="reportsSection_4b8k5">
          <h2>Доступные отчеты</h2>

          {/* Отображение отчетов по категориям */}
          {Object.entries(reportsByCategory).map(([category, reports]) => (
            <div key={category} className="reportCategorySection_3x8k2">
              <h3 className="reportCategoryTitle_5m9q1">{category}</h3>
              <div className="reportsGridLayout_6n9m1">
                {reports.map((report) => (
                  <button
                    key={report.id}
                    className={`reportButtonElement_5v2l7 ${
                      readyModals.includes(report.id) ? "report-ready" : ""
                    }`}
                    onClick={() => openModal(report.id)}
                    title={
                      report.description || `Создать отчет: ${report.title}`
                    }
                  >
                    <span className="reportIconSymbol_8h4x3">
                      {report.icon}
                    </span>
                    <span className="reportTitleText_9j1p6">
                      {report.title}
                    </span>
                    {readyModals.includes(report.id) && (
                      <span className="report-status-badge">Готов</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Рендер модального окна */}
      {renderModal()}
    </div>
  );
};

export default Home;
