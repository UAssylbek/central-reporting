// frontend/src/pages/ConsolidatedTariffPage/ConsolidatedTariffPage.tsx
import { useState } from "react";
import { Card } from "../../shared/ui/Card/Card";
import { Button } from "../../shared/ui/Button/Button";
import { Input } from "../../shared/ui/Input/Input";

type TabType = "data" | "settings";
type SettingsTabType = "formatting" | "selection";

interface Element {
  id: number;
  type: string;
  label: string;
  selected: boolean;
}

export function ConsolidatedTariffPage() {
  // Main state
  const [activeTab, setActiveTab] = useState<TabType>("data");
  const [reportGenerated, setReportGenerated] = useState(false);
  const [showSettings, setShowSettings] = useState(true);
  const [showHelp, setShowHelp] = useState(false);

  // Data tab state
  const [month, setMonth] = useState("Февраль 2025");
  const [reportVariant, setReportVariant] = useState("Общий");
  const [detailedInfo, setDetailedInfo] = useState(false);
  const [hideSettingsOnGenerate, setHideSettingsOnGenerate] = useState(true);
  const [distributeByBudget, setDistributeByBudget] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Settings tab state
  const [settingsTab, setSettingsTab] = useState<SettingsTabType>("formatting");
  const [fontSize, setFontSize] = useState("10");
  const [selectedElements, setSelectedElements] = useState<Element[]>([
    { id: 1, type: "Представление", label: "Отбор", selected: true },
  ]);

  const reportVariants = [
    "Общий",
    "Административно-управленческий персонал",
    "Административно-хозяйственный персонал",
    "Педагогический персонал",
    "Хозяйственный персонал",
  ];

  const handleGenerateReport = () => {
    setReportGenerated(true);
    if (hideSettingsOnGenerate) {
      setShowSettings(false);
    }
  };

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

  const deleteElement = (id: number) => {
    setSelectedElements(selectedElements.filter((el) => el.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Сводный тарификационный список
          </h1>
          <p className="mt-2 text-gray-600 dark:text-zinc-400">
            Консолидированный отчет по тарификации всех организаций
          </p>
        </div>

        {/* Help button */}
        <Button
          variant="ghost"
          size="sm"
          className="cursor-pointer"
          onClick={() => setShowHelp(!showHelp)}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </Button>
      </div>

      {/* Help message */}
      {showHelp && (
        <Card>
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <svg
                  className="w-6 h-6 text-blue-600 dark:text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  О сводном тарификационном списке
                </h3>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  Этот отчет формирует консолидированные данные по тарификации
                  сотрудников всех организаций. Вы можете выбрать период,
                  вариант отчета и дополнительные параметры.
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left panel - Settings (collapsible) */}
        {showSettings && (
          <div className="lg:col-span-4">
            <Card title="Параметры отчета">
              {/* Tabs */}
              <div className="flex border-b border-gray-200 dark:border-zinc-700 mb-4">
                <button
                  onClick={() => setActiveTab("data")}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
                    activeTab === "data"
                      ? "border-blue-600 text-blue-600 dark:text-blue-400"
                      : "border-transparent text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  Данные
                </button>
                <button
                  onClick={() => setActiveTab("settings")}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
                    activeTab === "settings"
                      ? "border-blue-600 text-blue-600 dark:text-blue-400"
                      : "border-transparent text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  Настройки
                </button>
              </div>

              {/* Data Tab */}
              {activeTab === "data" && (
                <div className="space-y-4">
                  {/* Month */}
                  <Input
                    label="Месяц регистрации"
                    type="month"
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                  />

                  {/* Report Variant */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300">
                      Вариант отчета
                    </label>
                    <select
                      value={reportVariant}
                      onChange={(e) => setReportVariant(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {reportVariants.map((variant) => (
                        <option key={variant} value={variant}>
                          {variant}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Checkboxes */}
                  <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-zinc-700">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={detailedInfo}
                        onChange={(e) => setDetailedInfo(e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                      />
                      <span className="text-sm text-gray-700 dark:text-zinc-300">
                        Вывести подробную информацию
                      </span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hideSettingsOnGenerate}
                        onChange={(e) =>
                          setHideSettingsOnGenerate(e.target.checked)
                        }
                        className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                      />
                      <span className="text-sm text-gray-700 dark:text-zinc-300">
                        Скрыть настройки после формирования
                      </span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={distributeByBudget}
                        onChange={(e) =>
                          setDistributeByBudget(e.target.checked)
                        }
                        className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                      />
                      <span className="text-sm text-gray-700 dark:text-zinc-300">
                        Распределить по бюджетам
                      </span>
                    </label>
                  </div>
                </div>
              )}

              {/* Settings Tab */}
              {activeTab === "settings" && (
                <div className="space-y-4">
                  {/* Settings sub-tabs */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSettingsTab("formatting")}
                      className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                        settingsTab === "formatting"
                          ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                          : "bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400"
                      }`}
                    >
                      Оформление
                    </button>
                    <button
                      onClick={() => setSettingsTab("selection")}
                      className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                        settingsTab === "selection"
                          ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                          : "bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400"
                      }`}
                    >
                      Отбор
                    </button>
                  </div>

                  {/* Formatting settings */}
                  {settingsTab === "formatting" && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300">
                          Размер шрифта
                        </label>
                        <input
                          type="number"
                          min="8"
                          max="16"
                          value={fontSize}
                          onChange={(e) => setFontSize(e.target.value)}
                          className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-600 rounded-lg text-gray-900 dark:text-white"
                        />
                      </div>
                      <p className="text-sm text-gray-600 dark:text-zinc-400">
                        Настройки оформления отчета
                      </p>
                    </div>
                  )}

                  {/* Selection settings */}
                  {settingsTab === "selection" && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700 dark:text-zinc-300">
                          Элементы отбора
                        </span>
                        <Button size="sm" onClick={addNewElement} className="cursor-pointer">
                          + Добавить
                        </Button>
                      </div>

                      {/* Elements list */}
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {selectedElements.map((element) => (
                          <div
                            key={element.id}
                            className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-colors ${
                              element.selected
                                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                                : "border-gray-200 dark:border-zinc-700"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={element.selected}
                              onChange={() => toggleElement(element.id)}
                              className="w-4 h-4 text-blue-600 rounded"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                {element.label}
                              </div>
                              <div className="text-xs text-gray-600 dark:text-zinc-400">
                                {element.type}
                              </div>
                            </div>
                            <button
                              onClick={() => deleteElement(element.id)}
                              className="text-red-600 hover:text-red-700 dark:text-red-400 p-1 cursor-pointer"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Generate button */}
              <div className="pt-4 border-t border-gray-200 dark:border-zinc-700 mt-6">
                <Button
                  fullWidth
                  className="cursor-pointer"
                  onClick={handleGenerateReport}
                  disabled={!month}
                >
                  Сформировать отчет
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Right panel - Report preview/results */}
        <div className={showSettings ? "lg:col-span-8" : "lg:col-span-12"}>
          <Card>
            {/* Toggle settings button */}
            {!showSettings && (
              <div className="mb-4">
                <Button
                  variant="secondary"
                  size="sm"
                  className="cursor-pointer"
                  onClick={() => setShowSettings(true)}
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  Показать настройки
                </Button>
              </div>
            )}

            {/* Report content */}
            {!reportGenerated ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-20 h-20 bg-gray-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center mb-6">
                  <svg
                    className="w-10 h-10 text-gray-400 dark:text-zinc-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Отчет не сформирован
                </h3>
                <p className="text-gray-600 dark:text-zinc-400 max-w-md">
                  Укажите параметры отчета и нажмите "Сформировать отчет" для
                  создания
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Report header */}
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/10 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Сводный тарификационный список
                  </h2>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-700 dark:text-zinc-300">
                    <div>
                      <span className="font-medium">Период:</span> {month}
                    </div>
                    <div>
                      <span className="font-medium">Вариант:</span>{" "}
                      {reportVariant}
                    </div>
                    {detailedInfo && (
                      <div className="text-blue-600 dark:text-blue-400">
                        Подробная информация включена
                      </div>
                    )}
                  </div>
                </div>

                {/* Search */}
                <Input
                  placeholder="Поиск по организациям..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  leftIcon={
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  }
                />

                {/* Report table preview */}
                <div className="border border-gray-200 dark:border-zinc-700 rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 dark:bg-zinc-800 border-b border-gray-200 dark:border-zinc-700">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                            Организация
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                            Сотрудников
                          </th>
                          <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">
                            Ставки
                          </th>
                          <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">
                            Фонд оплаты
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-zinc-700">
                        <tr className="hover:bg-gray-50 dark:hover:bg-zinc-800">
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                            Организация 1
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700 dark:text-zinc-300">
                            45
                          </td>
                          <td className="px-4 py-3 text-sm text-right text-gray-700 dark:text-zinc-300">
                            38.5
                          </td>
                          <td className="px-4 py-3 text-sm text-right font-medium text-gray-900 dark:text-white">
                            12,450,000 ₸
                          </td>
                        </tr>
                        <tr className="hover:bg-gray-50 dark:hover:bg-zinc-800">
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                            Организация 2
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700 dark:text-zinc-300">
                            32
                          </td>
                          <td className="px-4 py-3 text-sm text-right text-gray-700 dark:text-zinc-300">
                            28.0
                          </td>
                          <td className="px-4 py-3 text-sm text-right font-medium text-gray-900 dark:text-white">
                            9,240,000 ₸
                          </td>
                        </tr>
                        <tr className="hover:bg-gray-50 dark:hover:bg-zinc-800">
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                            Организация 3
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700 dark:text-zinc-300">
                            58
                          </td>
                          <td className="px-4 py-3 text-sm text-right text-gray-700 dark:text-zinc-300">
                            52.5
                          </td>
                          <td className="px-4 py-3 text-sm text-right font-medium text-gray-900 dark:text-white">
                            16,800,000 ₸
                          </td>
                        </tr>
                        <tr className="bg-blue-50 dark:bg-blue-900/20 font-semibold">
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                            Итого:
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                            135
                          </td>
                          <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white">
                            119.0
                          </td>
                          <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white">
                            38,490,000 ₸
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 justify-end pt-4 border-t border-gray-200 dark:border-zinc-700">
                  <Button variant="secondary">
                    <svg
                      className="w-5 h-5 mr-2 cursor-pointer"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                      />
                    </svg>
                    Печать
                  </Button>
                  <Button>
                    <svg
                      className="w-5 h-5 mr-2 cursor-pointer"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      />
                    </svg>
                    Экспорт Excel
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
