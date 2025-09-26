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
          <div className="reportsGridLayout_6n9m1">
            {availableReports.map((report) => (
              <button
                key={report.id}
                className="reportButtonElement_5v2l7"
                onClick={() => openModal(report.id)}
              >
                <span className="reportIconSymbol_8h4x3">📊</span>
                <span className="reportTitleText_9j1p6">{report.title}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {selectedModal && (
        <div className="modalOverlayBackdrop_7k3m9" onClick={closeModal}>
          <div
            className="modalContentDialog_4q8r2"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modalHeaderSection_6w5t1">
              <h3>
                {availableReports.find((r) => r.id === selectedModal)?.title}
              </h3>
              <button className="modalCloseButton_3s9f4" onClick={closeModal}>
                ×
              </button>
            </div>
            <div className="modalBodyContent_8u7y5">
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
