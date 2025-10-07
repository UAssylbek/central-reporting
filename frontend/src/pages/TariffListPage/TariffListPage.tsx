// frontend/src/pages/TariffListPage/TariffListPage.tsx
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

export function TariffListPage() {
  // Main state
  const [activeTab, setActiveTab] = useState<TabType>("data");
  const [reportGenerated, setReportGenerated] = useState(false);
  const [showSettings, setShowSettings] = useState(true);
  const [showHelp, setShowHelp] = useState(false);

  // Data tab state
  const [month, setMonth] = useState("");
  const [organization, setOrganization] = useState("");
  const [reportVariant, setReportVariant] = useState("Общий");
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

  const organizations = [
    "Организация 1",
    "Организация 2",
    "Организация 3",
    "Организация 4",
  ];

  const handleGenerateReport = () => {
    if (!month || !organization) {
      alert("Заполните все обязательные поля");
      return;
    }
    setReportGenerated(true);
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
            Тарификационный список
          </h1>
          <p className="mt-2 text-gray-600 dark:text-zinc-400">
            Тарификационный список по конкретной организации
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
          <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <svg
                  className="w-6 h-6 text-orange-600 dark:text-orange-400"
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
                <h3 className="font-semibold text-orange-900 dark:text-orange-100 mb-2">
                  О тарификационном списке
                </h3>
                <p className="text-sm text-orange-800 dark:text-orange-200">
                  Этот отчет формирует детальные данные по тарификации
                  сотрудников выбранной организации. Необходимо указать период и
                  организацию.
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left panel - Settings */}
        {showSettings && (
          <div className="lg:col-span-4">
            <Card title="Параметры отчета">
              {/* Tabs */}
              <div className="flex border-b border-gray-200 dark:border-zinc-700 mb-4">
                <button
                  onClick={() => setActiveTab("data")}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
                    activeTab === "data"
                      ? "border-orange-600 text-orange-600 dark:text-orange-400"
                      : "border-transparent text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  Данные
                </button>
                <button
                  onClick={() => setActiveTab("settings")}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
                    activeTab === "settings"
                      ? "border-orange-600 text-orange-600 dark:text-orange-400"
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
                    required
                  />

                  {/* Organization */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300">
                      Организация <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={organization}
                      onChange={(e) => setOrganization(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent cursor-pointer"
                    >
                      <option value="">Выберите организацию...</option>
                      {organizations.map((org) => (
                        <option key={org} value={org}>
                          {org}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Report Variant */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300">
                      Вариант отчета
                    </label>
                    <select
                      value={reportVariant}
                      onChange={(e) => setReportVariant(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent cursor-pointer"
                    >
                      {reportVariants.map((variant) => (
                        <option key={variant} value={variant}>
                          {variant}
                        </option>
                      ))}
                    </select>
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
                          ? "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400"
                          : "bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400"
                      }`}
                    >
                      Оформление
                    </button>
                    <button
                      onClick={() => setSettingsTab("selection")}
                      className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                        settingsTab === "selection"
                          ? "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400"
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
                                ? "border-orange-500 bg-orange-50 dark:bg-orange-900/20"
                                : "border-gray-200 dark:border-zinc-700"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={element.selected}
                              onChange={() => toggleElement(element.id)}
                              className="w-4 h-4 text-orange-600 rounded"
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
                  disabled={!month || !organization}
                  variant="accent"
                >
                  Сформировать отчет
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Right panel - Report preview */}
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
                <p className="text-gray-600 dark:text-zinc-400 max-w-md mb-4">
                  Выберите месяц и организацию, затем нажмите "Сформировать
                  отчет"
                </p>
                {(!month || !organization) && (
                  <div className="text-sm text-orange-600 dark:text-orange-400">
                    {!month && !organization && "Заполните месяц и организацию"}
                    {!month && organization && "Выберите месяц"}
                    {month && !organization && "Выберите организацию"}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {/* Report header */}
                <div className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-900/10 rounded-lg p-6 border border-orange-200 dark:border-orange-800">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Тарификационный список
                  </h2>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-700 dark:text-zinc-300">
                    <div>
                      <span className="font-medium">Период:</span> {month}
                    </div>
                    <div>
                      <span className="font-medium">Организация:</span>{" "}
                      {organization}
                    </div>
                    <div>
                      <span className="font-medium">Вариант:</span>{" "}
                      {reportVariant}
                    </div>
                  </div>
                </div>

                {/* Search */}
                <Input
                  placeholder="Поиск сотрудников..."
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

                {/* Report table */}
                <div className="border border-gray-200 dark:border-zinc-700 rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 dark:bg-zinc-800 border-b border-gray-200 dark:border-zinc-700">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                            ФИО
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                            Должность
                          </th>
                          <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900 dark:text-white">
                            Ставка
                          </th>
                          <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">
                            Оклад
                          </th>
                          <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">
                            Надбавки
                          </th>
                          <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">
                            Итого
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-zinc-700">
                        <tr className="hover:bg-gray-50 dark:hover:bg-zinc-800">
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                            Иванов Иван Иванович
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700 dark:text-zinc-300">
                            Директор
                          </td>
                          <td className="px-4 py-3 text-sm text-center text-gray-700 dark:text-zinc-300">
                            1.0
                          </td>
                          <td className="px-4 py-3 text-sm text-right text-gray-700 dark:text-zinc-300">
                            450,000 ₸
                          </td>
                          <td className="px-4 py-3 text-sm text-right text-gray-700 dark:text-zinc-300">
                            50,000 ₸
                          </td>
                          <td className="px-4 py-3 text-sm text-right font-medium text-gray-900 dark:text-white">
                            500,000 ₸
                          </td>
                        </tr>
                        <tr className="hover:bg-gray-50 dark:hover:bg-zinc-800">
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                            Петрова Елена Сергеевна
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700 dark:text-zinc-300">
                            Главный бухгалтер
                          </td>
                          <td className="px-4 py-3 text-sm text-center text-gray-700 dark:text-zinc-300">
                            1.0
                          </td>
                          <td className="px-4 py-3 text-sm text-right text-gray-700 dark:text-zinc-300">
                            380,000 ₸
                          </td>
                          <td className="px-4 py-3 text-sm text-right text-gray-700 dark:text-zinc-300">
                            40,000 ₸
                          </td>
                          <td className="px-4 py-3 text-sm text-right font-medium text-gray-900 dark:text-white">
                            420,000 ₸
                          </td>
                        </tr>
                        <tr className="hover:bg-gray-50 dark:hover:bg-zinc-800">
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                            Сидоров Алексей Михайлович
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700 dark:text-zinc-300">
                            Учитель математики
                          </td>
                          <td className="px-4 py-3 text-sm text-center text-gray-700 dark:text-zinc-300">
                            0.75
                          </td>
                          <td className="px-4 py-3 text-sm text-right text-gray-700 dark:text-zinc-300">
                            280,000 ₸
                          </td>
                          <td className="px-4 py-3 text-sm text-right text-gray-700 dark:text-zinc-300">
                            30,000 ₸
                          </td>
                          <td className="px-4 py-3 text-sm text-right font-medium text-gray-900 dark:text-white">
                            310,000 ₸
                          </td>
                        </tr>
                        <tr className="bg-orange-50 dark:bg-orange-900/20 font-semibold">
                          <td
                            colSpan={2}
                            className="px-4 py-3 text-sm text-gray-900 dark:text-white"
                          >
                            Итого:
                          </td>
                          <td className="px-4 py-3 text-sm text-center text-gray-900 dark:text-white">
                            2.75
                          </td>
                          <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white">
                            1,110,000 ₸
                          </td>
                          <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white">
                            120,000 ₸
                          </td>
                          <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white">
                            1,230,000 ₸
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 justify-end pt-4 border-t border-gray-200 dark:border-zinc-700">
                  <Button variant="secondary" className="cursor-pointer">
                    <svg
                      className="w-5 h-5 mr-2"
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
                  <Button variant="accent" className="cursor-pointer">
                    <svg
                      className="w-5 h-5 mr-2"
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
