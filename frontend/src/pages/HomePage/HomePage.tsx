// frontend/src/pages/HomePage/HomePage.tsx
import { useState } from "react";
import { useToast } from "../../shared/hooks/useToast";
import { Toast } from "../../shared/ui/Toast/Toast";
import { REPORTS_LIST } from "../../shared/config/reportsList";
import { UniversalReportModal } from "../../features/reports/UniversalReportModal/UniversalReportModal";
import { getReportConfig } from "../../features/reports/configs";
import type { ReportType } from "../../shared/types/reports";

export function HomePage() {
  const { toasts, hideToast, success, error: showError } = useToast();
  const [searchQuery, setSearchQuery] = useState("");

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReportType, setSelectedReportType] =
    useState<ReportType | null>(null);

  const handleReportClick = (reportId: ReportType, title: string) => {
    const config = getReportConfig(reportId);

    if (!config) {
      showError(`Конфигурация для отчёта "${title}" ещё не реализована`);
      return;
    }

    setSelectedReportType(reportId);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedReportType(null);
  };

  const handleReportSubmit = async (formData: Record<string, unknown>) => {
    // TODO: Вызов API для генерации отчёта
    console.log("Report data:", formData);

    // Имитация API вызова
    await new Promise((resolve) => setTimeout(resolve, 1000));

    success("Запрос на формирование отчёта создан!");
  };

  // Получаем конфиг выбранного отчёта
  const selectedConfig = selectedReportType
    ? getReportConfig(selectedReportType)
    : null;

  // Фильтрация отчётов
  const filteredReports = REPORTS_LIST.filter(
    (report) =>
      report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (report.category?.toLowerCase().includes(searchQuery.toLowerCase()) ??
        false)
  );

  // Группировка по категориям
  const categories = Array.from(
    new Set(filteredReports.map((r) => r.category).filter(Boolean))
  ) as string[];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Отчёты
          </h1>
          <p className="text-gray-600 dark:text-zinc-400">
            Выберите отчёт для формирования
          </p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Поиск отчётов..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 pl-11 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white"
            />
            <svg
              className="absolute left-3 top-3.5 w-5 h-5 text-gray-400"
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
          </div>
        </div>

        {/* Reports by Category */}
        {categories.map((category) => {
          const categoryReports = filteredReports.filter(
            (r) => r.category === category
          );

          return (
            <div key={category} className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                {category}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryReports.map((report) => (
                  <button
                    key={report.id}
                    onClick={() =>
                      handleReportClick(report.id as ReportType, report.title)
                    }
                    className="group p-6 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg hover:shadow-lg hover:border-blue-500 dark:hover:border-blue-400 transition-all text-left"
                  >
                    <div className="flex items-start gap-4">
                      <span className="text-3xl">{report.icon}</span>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                          {report.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-zinc-400">
                          {report.description}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          );
        })}

        {filteredReports.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-zinc-400">
              Отчёты не найдены
            </p>
          </div>
        )}
      </div>

      {/* Universal Report Modal */}
      {isModalOpen && selectedReportType && selectedConfig && (
        <UniversalReportModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          reportType={selectedReportType}
          config={selectedConfig}
          onSubmit={handleReportSubmit}
          startStep={1} // Начинаем со страницы "Организации" (индекс 1)
          allowReportChange={false} // Для конкретного отчёта не разрешаем смену
        />
      )}

      {/* Toast Notifications */}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            variant={toast.variant}
            onClose={() => hideToast(toast.id)}
          />
        ))}
      </div>
    </div>
  );
}
