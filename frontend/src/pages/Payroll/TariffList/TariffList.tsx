// src/pages/Payroll/TariffList/TariffList.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./TariffList.css";

interface Element {
  id: number;
  type: string;
  label: string;
  selected: boolean;
}

const TariffList: React.FC = () => {
  const navigate = useNavigate();
  const [showSettings, setShowSettings] = useState(true);
  const [showHelp, setShowHelp] = useState(false);
  const [activeTab, setActiveTab] = useState<"data" | "settings">("data");
  const [month, setMonth] = useState("");
  const [organization, setOrganization] = useState("");
  const [reportVariant, setReportVariant] = useState("Общий");
  const [searchQuery, setSearchQuery] = useState("");
  const [reportGenerated, setReportGenerated] = useState(false);

  // Настройки отчета
  const [settingsTab, setSettingsTab] = useState<"formatting" | "selection">(
    "formatting"
  );
  const [fontSize, setFontSize] = useState("");
  const [fontSizeValue, setFontSizeValue] = useState(0);
  const [selectedElements, setSelectedElements] = useState<Element[]>([
    { id: 1, type: "Представление", label: "Отбор", selected: true },
  ]);

  const handleGenerateReport = () => {
    setReportGenerated(true);
  };

  const reportVariants = [
    "Общий",
    "Административно-управленческий персонал",
    "Административно-хозяйственный персонал",
    "Педагогический персонал",
    "Хозяйственный персонал",
  ];

  const addNewElement = () => {
    const newElement: Element = {
      id: selectedElements.length + 1,
      type: "Представление",
      label: `Новый элемент ${selectedElements.length + 1}`,
      selected: false,
    };
    setSelectedElements([...selectedElements, newElement]);
  };

  const toggleElement = (id: number) => {
    setSelectedElements(
      selectedElements.map((el) =>
        el.id === id ? { ...el, selected: !el.selected } : el
      )
    );
  };

  return (
    <div className="tariff-list-page">
      {/* Header */}
      <div className="tariff-list-header">
        <div className="tariff-list-title-section">
          <h1 className="tariff-list-title">Тарификационный список (Общий)</h1>
          <button
            onClick={() => navigate("/payroll/consolidated-tariff")}
            className="tariff-list-navigate-btn"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Вернуться к сводному списку
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="tariff-list-toolbar">
        <div className="tariff-list-toolbar-left">
          <button
            onClick={handleGenerateReport}
            className="tariff-list-btn-primary"
          >
            Сформировать отчет
          </button>

          <button className="tariff-list-btn-icon" title="Печать">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <polyline points="6 9 6 2 18 2 18 9" />
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
              <rect x="6" y="14" width="12" height="8" />
            </svg>
          </button>

          <button className="tariff-list-btn-icon" title="Настройки печати">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M12 1v6m0 6v6m5.2-13.2l-4.2 4.2m0 6l4.2 4.2M23 12h-6m-6 0H1m18.2 5.2l-4.2-4.2m0-6l4.2-4.2" />
            </svg>
          </button>

          <button
            className="tariff-list-btn-icon"
            title="Предварительный просмотр"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </button>

          <button className="tariff-list-btn-secondary">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            Сохранить в Excel
          </button>
        </div>

        <div className="tariff-list-toolbar-right">
          <input
            type="text"
            placeholder="Поиск..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="tariff-list-search"
          />

          <button
            onClick={() => setShowSettings(!showSettings)}
            className="tariff-list-btn-icon"
            title={showSettings ? "Скрыть настройки" : "Показать настройки"}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <line x1="4" y1="21" x2="4" y2="14" />
              <line x1="4" y1="10" x2="4" y2="3" />
              <line x1="12" y1="21" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12" y2="3" />
              <line x1="20" y1="21" x2="20" y2="16" />
              <line x1="20" y1="12" x2="20" y2="3" />
              <line x1="1" y1="14" x2="7" y2="14" />
              <line x1="9" y1="8" x2="15" y2="8" />
              <line x1="17" y1="16" x2="23" y2="16" />
            </svg>
          </button>

          <button
            onClick={() => setShowHelp(!showHelp)}
            className="tariff-list-btn-help"
            title="Справка"
          >
            ?
          </button>
        </div>
      </div>

      {/* Help Panel */}
      {showHelp && (
        <div className="tariff-list-help-panel">
          <div className="tariff-list-help-content">
            <button
              onClick={() => setShowHelp(false)}
              className="tariff-list-help-close"
            >
              ×
            </button>
            <h3>Тарификационный список</h3>
            <p>
              Отчёт <strong>"Тарификационный список"</strong> позволяет
              сформировать данные по конкретной организации в следующих
              вариантах:
            </p>
            <ul>
              <li>Административно-управленческий персонал;</li>
              <li>Административно-хозяйственный персонал;</li>
              <li>Педагогический персонал;</li>
              <li>Хозяйственный персонал.</li>
            </ul>
            <p>
              Для формирования отчёта необходимо выбрать организацию, месяц
              начисления и вариант отчёта. После чего сформировать отчёт.
            </p>
            <p>
              Кнопка <strong>«Обновить данные»</strong> позволяет выполнить
              получение данных по выбранной организации.
            </p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="tariff-list-content">
        <div
          className={`tariff-list-report-area ${
            showSettings ? "with-settings" : ""
          }`}
        >
          {!reportGenerated ? (
            <div className="tariff-list-placeholder">
              <div className="tariff-list-placeholder-icon">📋</div>
              <p className="tariff-list-placeholder-text">
                Требуется получение данных. Нажмите "Обновить данные" для
                получения отчета.
              </p>
            </div>
          ) : (
            <div className="tariff-list-report-result">
              <p>Здесь будет отображаться сформированный отчет</p>
            </div>
          )}
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="tariff-list-settings-panel">
            <div className="tariff-list-tabs">
              <button
                className={`tariff-list-tab ${
                  activeTab === "data" ? "active" : ""
                }`}
                onClick={() => setActiveTab("data")}
              >
                Данные
              </button>
              <button
                className={`tariff-list-tab ${
                  activeTab === "settings" ? "active" : ""
                }`}
                onClick={() => setActiveTab("settings")}
              >
                Настройки отчета
              </button>
            </div>

            <div className="tariff-list-tab-content">
              {activeTab === "data" && (
                <div className="tariff-list-settings-content">
                  <div className="tariff-list-form-group">
                    <label>Месяц начисления:</label>
                    <div className="tariff-list-input-group">
                      <input
                        type="text"
                        value={month}
                        onChange={(e) => setMonth(e.target.value)}
                        className="tariff-list-input"
                        placeholder="Выберите месяц"
                      />
                      <button className="tariff-list-calendar-btn">📅</button>
                      <button className="tariff-list-clear-btn">↻</button>
                    </div>
                  </div>

                  <div className="tariff-list-form-group">
                    <label>Организация:</label>
                    <div className="tariff-list-input-group">
                      <input
                        type="text"
                        value={organization}
                        onChange={(e) => setOrganization(e.target.value)}
                        className="tariff-list-input"
                        placeholder="Выберите организацию"
                      />
                      <button className="tariff-list-select-btn">...</button>
                      <button className="tariff-list-clear-btn">↻</button>
                    </div>
                  </div>

                  <div className="tariff-list-form-group">
                    <label>Вариант отчета:</label>
                    <select
                      value={reportVariant}
                      onChange={(e) => setReportVariant(e.target.value)}
                      className="tariff-list-select"
                    >
                      {reportVariants.map((variant) => (
                        <option key={variant} value={variant}>
                          {variant}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="tariff-list-actions">
                    <button className="tariff-list-btn-action">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                      >
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                      Обновить данные
                    </button>
                  </div>
                </div>
              )}

              {activeTab === "settings" && (
                <div className="tariff-list-settings-content">
                  <div className="tariff-list-settings-tabs">
                    <button
                      className={`tariff-list-settings-tab-btn ${
                        settingsTab === "formatting" ? "active" : ""
                      }`}
                      onClick={() => setSettingsTab("formatting")}
                    >
                      Оформление
                    </button>
                    <button
                      className={`tariff-list-settings-tab-btn ${
                        settingsTab === "selection" ? "active" : ""
                      }`}
                      onClick={() => setSettingsTab("selection")}
                    >
                      Отборы
                    </button>
                  </div>

                  {settingsTab === "formatting" && (
                    <div className="tariff-list-formatting-content">
                      <div className="tariff-list-form-group">
                        <label>Шрифт:</label>
                        <div className="tariff-list-font-input-group">
                          <select
                            value={fontSize}
                            onChange={(e) => setFontSize(e.target.value)}
                            className="tariff-list-font-select"
                          >
                            <option value="">Выберите шрифт</option>
                            <option value="Arial">Arial</option>
                            <option value="Times New Roman">
                              Times New Roman
                            </option>
                            <option value="Calibri">Calibri</option>
                          </select>
                          <div className="tariff-list-font-size-group">
                            <label className="tariff-list-font-size-label">
                              Размер:
                            </label>
                            <input
                              type="number"
                              value={fontSizeValue}
                              onChange={(e) =>
                                setFontSizeValue(Number(e.target.value))
                              }
                              className="tariff-list-font-size-input"
                              min="0"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {settingsTab === "selection" && (
                    <div className="tariff-list-selection-content">
                      <button
                        onClick={addNewElement}
                        className="tariff-list-add-element-btn"
                      >
                        ➕ Добавить новый элемент
                      </button>

                      <div className="tariff-list-elements-list">
                        <div className="tariff-list-elements-header">
                          <span className="tariff-list-elements-header-text">
                            Представление
                          </span>
                          <button className="tariff-list-more-options-btn">
                            Еще ▼
                          </button>
                        </div>

                        {selectedElements.map((element) => (
                          <div
                            key={element.id}
                            className={`tariff-list-element-row ${
                              element.selected ? "selected" : ""
                            }`}
                            onClick={() => toggleElement(element.id)}
                          >
                            <div className="tariff-list-element-icon">
                              {element.selected ? "✓" : "□"}
                            </div>
                            <span className="tariff-list-element-label">
                              {element.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TariffList;
