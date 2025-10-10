import { useState } from "react";
import { useToast } from "../../shared/hooks/useToast";
import { Toast } from "../../shared/ui/Toast/Toast";
import { Card } from "../../shared/ui/Card/Card";
import { Button } from "../../shared/ui/Button/Button";
import { REPORTS_LIST } from "../../shared/config/reportsList";
import { UniversalReportModal } from "../../features/reports/UniversalReportModal/UniversalReportModal";
import { getReportConfig } from "../../features/reports/configs";
import type { ReportType } from "../../shared/types/reports";

export function HomePage() {
  const { toasts, hideToast, success, error: showError } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
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
    console.log("Report data:", formData);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    success("Запрос на формирование отчёта создан!");
  };

  const selectedConfig = selectedReportType
    ? getReportConfig(selectedReportType)
    : null;

  const filteredReports = REPORTS_LIST.filter(
    (report) =>
      report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (report.category?.toLowerCase().includes(searchQuery.toLowerCase()) ??
        false)
  );

  const categories = Array.from(
    new Set(filteredReports.map((r) => r.category).filter(Boolean))
  ) as string[];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Отчёты
        </h1>
        <p className="text-gray-600 dark:text-zinc-400">
          Выберите отчёт для формирования
        </p>
      </div>

      {/* Search */}
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

      {/* Reports by Category */}
      {categories.map((category) => {
        const categoryReports = filteredReports.filter(
          (r) => r.category === category
        );

        return (
          <div key={category} className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {category}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categoryReports.map((report) => (
                <Card key={report.id}>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl">{report.icon}</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {report.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-zinc-400 mb-4">
                        {report.description}
                      </p>
                      <Button
                        size="sm"
                        className="cursor-pointer"
                        onClick={() =>
                          handleReportClick(
                            report.id as ReportType,
                            report.title
                          )
                        }
                      >
                        Открыть →
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        );
      })}

      {filteredReports.length === 0 && (
        <Card>
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-zinc-400">
              Отчёты не найдены
            </p>
          </div>
        </Card>
      )}

      {/* Universal Report Modal */}
      {isModalOpen && selectedReportType && selectedConfig && (
        <UniversalReportModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          reportType={selectedReportType}
          config={selectedConfig}
          onSubmit={handleReportSubmit}
          startStep={1}
          allowReportChange={true}
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
