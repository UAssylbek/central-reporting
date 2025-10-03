// src/pages/Payroll/ConsolidatedTariff/ConsolidatedTariff.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ConsolidatedTariff.css";

interface Element {
  id: number;
  type: string;
  label: string;
  selected: boolean;
}

const ConsolidatedTariff: React.FC = () => {
  const navigate = useNavigate();
  const [showSettings, setShowSettings] = useState(true);
  const [showHelp, setShowHelp] = useState(false);
  const [hideSettingsOnGenerate, setHideSettingsOnGenerate] = useState(true);
  const [distributeByBudget, setDistributeByBudget] = useState(false);
  const [activeTab, setActiveTab] = useState<"data" | "settings">("data");
  const [month, setMonth] = useState("Февраль 2025");
  const [reportVariant, setReportVariant] = useState("Общий");
  const [detailedInfo, setDetailedInfo] = useState(false);
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
    if (hideSettingsOnGenerate) {
      setShowSettings(false);
    }
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
    <div className="consolidated-tariff-page">
      {/* Header */}
      <div className="consolidated-tariff-header">
        <div className="consolidated-tariff-title-section">
          <h1 className="consolidated-tariff-title">
            Сводный тарификационный список (Общий)
          </h1>
          <button
            onClick={() => navigate("/payroll/tariff-list")}
            className="consolidated-tariff-navigate-btn"
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
                d="M9 5l7 7-7 7"
              />
            </svg>
            Перейти к тарификационному списку
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="consolidated-tariff-toolbar">
        <div className="consolidated-tariff-toolbar-left">
          <button
            onClick={handleGenerateReport}
            className="consolidated-tariff-btn-primary"
          >
            Сформировать отчет
          </button>

          <button className="consolidated-tariff-btn-icon" title="Печать">
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

          <button
            className="consolidated-tariff-btn-icon"
            title="Настройки печати"
          >
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
            className="consolidated-tariff-btn-icon"
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

          <button className="consolidated-tariff-btn-secondary">
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

        <div className="consolidated-tariff-toolbar-right">
          <input
            type="text"
            placeholder="Поиск..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="consolidated-tariff-search"
          />

          <button
            onClick={() => setShowSettings(!showSettings)}
            className="consolidated-tariff-btn-icon"
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
            className="consolidated-tariff-btn-help"
            title="Справка"
          >
            ?
          </button>
        </div>
      </div>

      {/* Help Panel */}
      {showHelp && (
        <div className="consolidated-tariff-help-panel">
          <div className="consolidated-tariff-help-content">
            <button
              onClick={() => setShowHelp(false)}
              className="consolidated-tariff-help-close"
            >
              ×
            </button>
            <h3>Сводный тарификационный список</h3>
            <p>
              Отчёт <strong>"Сводный тарификационный список"</strong> позволяет
              сформировать сводные данные по выбранным организациям в следующих
              вариантах:
            </p>
            <ul>
              <li>Административно-управленческий персонал;</li>
              <li>Административно-хозяйственный персонал;</li>
              <li>Педагогический персонал;</li>
              <li>Хозяйственный персонал.</li>
            </ul>
            <p>
              Для этого необходимо пометить галочкой организации, по которым
              нужно будет сформировать отчёт, выбрать месяц начисления и
              настройки отчёта. После чего сформировать отчёт.
            </p>
            <p>
              Кнопка <strong>«Получить данные»</strong> позволяет выполнить
              получение данных по выбранным организациям.
            </p>
            <p>
              Кнопка <strong>«Дополучить данные»</strong> позволяет получить
              данные по оставшимся организациям.
            </p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="consolidated-tariff-content">
        <div
          className={`consolidated-tariff-report-area ${
            showSettings ? "with-settings" : ""
          }`}
        >
          {!reportGenerated ? (
            <div className="consolidated-tariff-placeholder">
              <div className="consolidated-tariff-placeholder-icon">📊</div>
              <p className="consolidated-tariff-placeholder-text">
                Отчет не сформирован. Нажмите "Сформировать" для получения
                отчета.
              </p>
            </div>
          ) : (
            <div className="consolidated-tariff-report-result">
              <p>Здесь будет отображаться сформированный отчет</p>
            </div>
          )}
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="consolidated-tariff-settings-panel">
            <div className="consolidated-tariff-settings-header">
              <label className="consolidated-tariff-checkbox">
                <input
                  type="checkbox"
                  checked={hideSettingsOnGenerate}
                  onChange={(e) => setHideSettingsOnGenerate(e.target.checked)}
                />
                <span>Скрывать настройки при формировании отчета</span>
              </label>

              <label className="consolidated-tariff-checkbox">
                <input
                  type="checkbox"
                  checked={distributeByBudget}
                  onChange={(e) => setDistributeByBudget(e.target.checked)}
                />
                <span>Распределить по бюджетам</span>
              </label>
            </div>

            <div className="consolidated-tariff-tabs">
              <button
                className={`consolidated-tariff-tab ${
                  activeTab === "data" ? "active" : ""
                }`}
                onClick={() => setActiveTab("data")}
              >
                Данные
              </button>
              <button
                className={`consolidated-tariff-tab ${
                  activeTab === "settings" ? "active" : ""
                }`}
                onClick={() => setActiveTab("settings")}
              >
                Настройки отчета
              </button>
            </div>

            {activeTab === "data" && (
              <div className="consolidated-tariff-tab-content">
                <div className="consolidated-tariff-form-group">
                  <label>Месяц начисления:</label>
                  <div className="consolidated-tariff-input-group">
                    <input
                      type="text"
                      value={month}
                      onChange={(e) => setMonth(e.target.value)}
                      className="consolidated-tariff-input"
                    />
                    <button className="consolidated-tariff-calendar-btn">
                      📅
                    </button>
                    <button className="consolidated-tariff-clear-btn">↻</button>
                  </div>
                </div>

                <div className="consolidated-tariff-form-group">
                  <label>Вариант отчета:</label>
                  <select
                    value={reportVariant}
                    onChange={(e) => setReportVariant(e.target.value)}
                    className="consolidated-tariff-select"
                  >
                    {reportVariants.map((variant) => (
                      <option key={variant} value={variant}>
                        {variant}
                      </option>
                    ))}
                  </select>
                </div>

                <label className="consolidated-tariff-checkbox">
                  <input
                    type="checkbox"
                    checked={detailedInfo}
                    onChange={(e) => setDetailedInfo(e.target.checked)}
                  />
                  <span>Детальная информация в разрезе классов обучения</span>
                </label>

                <div className="consolidated-tariff-actions">
                  <button className="consolidated-tariff-btn-action">
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
                    Получить данные
                  </button>

                  <button className="consolidated-tariff-btn-action">
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
                    Дополучить данные
                  </button>
                </div>

                <div className="consolidated-tariff-organizations">
                  <div className="consolidated-tariff-org-header">
                    <div className="consolidated-tariff-org-toolbar">
                      <button className="consolidated-tariff-org-btn">✓</button>
                      <button className="consolidated-tariff-org-btn">□</button>
                      <button className="consolidated-tariff-more-btn">
                        Еще ▼
                      </button>
                    </div>
                  </div>
                  <div className="consolidated-tariff-org-title">
                    Организация
                  </div>
                  <div className="consolidated-tariff-org-list">
                    <div className="consolidated-tariff-org-empty">
                      Организации не выбраны
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "settings" && (
              <div className="consolidated-tariff-tab-content">
                <div className="consolidated-tariff-settings-tabs">
                  <button
                    className={`consolidated-tariff-settings-tab-btn ${
                      settingsTab === "formatting" ? "active" : ""
                    }`}
                    onClick={() => setSettingsTab("formatting")}
                  >
                    Оформление
                  </button>
                  <button
                    className={`consolidated-tariff-settings-tab-btn ${
                      settingsTab === "selection" ? "active" : ""
                    }`}
                    onClick={() => setSettingsTab("selection")}
                  >
                    Отборы
                  </button>
                </div>

                {settingsTab === "formatting" && (
                  <div className="consolidated-tariff-settings-content">
                    <div className="consolidated-tariff-form-group">
                      <label>Шрифт:</label>
                      <div className="consolidated-tariff-font-input-group">
                        <select
                          value={fontSize}
                          onChange={(e) => setFontSize(e.target.value)}
                          className="consolidated-tariff-font-select"
                        >
                          <option value="">Выберите шрифт</option>
                          <option value="Arial">Arial</option>
                          <option value="Times New Roman">
                            Times New Roman
                          </option>
                          <option value="Calibri">Calibri</option>
                        </select>
                        <div className="consolidated-tariff-font-size-group">
                          <label className="consolidated-tariff-font-size-label">
                            Размер:
                          </label>
                          <input
                            type="number"
                            value={fontSizeValue}
                            onChange={(e) =>
                              setFontSizeValue(Number(e.target.value))
                            }
                            className="consolidated-tariff-font-size-input"
                            min="0"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {settingsTab === "selection" && (
                  <div className="consolidated-tariff-settings-content">
                    <button
                      onClick={addNewElement}
                      className="consolidated-tariff-add-element-btn"
                    >
                      ➕ Добавить новый элемент
                    </button>

                    <div className="consolidated-tariff-elements-list">
                      <div className="consolidated-tariff-elements-header">
                        <span className="consolidated-tariff-elements-header-text">
                          Представление
                        </span>
                        <button className="consolidated-tariff-more-options-btn">
                          Еще ▼
                        </button>
                      </div>

                      {selectedElements.map((element) => (
                        <div
                          key={element.id}
                          className={`consolidated-tariff-element-row ${
                            element.selected ? "selected" : ""
                          }`}
                          onClick={() => toggleElement(element.id)}
                        >
                          <div className="consolidated-tariff-element-icon">
                            {element.selected ? "✓" : "□"}
                          </div>
                          <span className="consolidated-tariff-element-label">
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
        )}
      </div>
    </div>
  );
};

export default ConsolidatedTariff;
