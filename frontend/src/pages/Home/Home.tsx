import React, { useState } from "react";
import "./Home.css";

const Home: React.FC = () => {
  const [selectedModal, setSelectedModal] = useState<string | null>(null);

  const availableReports = [
    { id: "consolidated-statement", title: "Сводная расчетная ведомость" },
    { id: "tariff-list", title: "Сводный тарификационный список" },
    { id: "os-balance", title: "Сводная ведомость остатков ОС" },
    { id: "long-term-search", title: "Поиск долгосрочных активов" },
    { id: "tmz-balance", title: "Сводная ведомость остатков ТМЗ" },
    { id: "expense-report", title: "Отчет по расходам по форме 4-20" },
    {
      id: "cash-flow-report",
      title: "Сводный отчет об исполнении денежных средств",
    },
    { id: "tariff-list-2", title: "Сводный тарификационный список" },
    { id: "long-term-search-2", title: "Поиск долгосрочных активов" },
    { id: "employee-list", title: "Сводный список работников организации" },
    { id: "long-term-search-3", title: "Поиск долгосрочных активов" },
    {
      id: "debt-report",
      title: "Сводный отчет по дебиторской и кредиторской задолженности",
    },
  ];

  const openModal = (modalId: string) => {
    setSelectedModal(modalId);
  };

  const closeModal = () => {
    setSelectedModal(null);
  };

  return (
    <div className="home">
      <h1>Начальная страница</h1>

      <div className="home-content">
        <div className="section">
          <h2>Доступные организации</h2>
          <div className="organizations-panel">
            <p className="empty-state">Организации будут загружены из API</p>
          </div>
        </div>

        <div className="section">
          <h2>Доступные отчеты</h2>
          <div className="reports-grid">
            {availableReports.map((report) => (
              <button
                key={report.id}
                className="report-button"
                onClick={() => openModal(report.id)}
              >
                <span className="report-icon">📊</span>
                <span className="report-title">{report.title}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {selectedModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                {availableReports.find((r) => r.id === selectedModal)?.title}
              </h3>
              <button className="close-button" onClick={closeModal}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <p>Модальное окно для отчета будет реализовано позже.</p>
              <p>ID отчета: {selectedModal}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
