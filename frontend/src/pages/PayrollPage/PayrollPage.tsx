// frontend/src/pages/PayrollPage/PayrollPage.tsx
import { Card } from "../../shared/ui/Card/Card";
import { Button } from "../../shared/ui/Button/Button";
import { useNavigate } from "react-router-dom";

export function PayrollPage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Зарплата и кадры
        </h1>
        <p className="mt-2 text-gray-600 dark:text-zinc-400">
          Кадровый учет и расчет заработной платы
        </p>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">💰</span>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Сводный тарификационный список
              </h3>
              <p className="text-sm text-gray-600 dark:text-zinc-400 mb-4">
                Консолидированный отчет по тарификации всех организаций
              </p>
              <Button
                size="sm"
                onClick={() => navigate("/payroll/consolidated-tariff")}
              >
                Открыть →
              </Button>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">📋</span>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Тарификационный список
              </h3>
              <p className="text-sm text-gray-600 dark:text-zinc-400 mb-4">
                Тарификационный список по конкретной организации
              </p>
              <Button
                size="sm"
                onClick={() => navigate("/payroll/tariff-list")}
              >
                Открыть →
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Content */}
      <Card>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-6">
            <span className="text-4xl">👥</span>
          </div>

          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Раздел в разработке
          </h2>

          <p className="text-gray-600 dark:text-zinc-400 max-w-md">
            Здесь будет кадровый учет и расчет зарплаты
          </p>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-2xl">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-2xl mb-2">📊</div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                Расчет зарплаты
              </div>
            </div>

            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-2xl mb-2">👤</div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                Кадровый учет
              </div>
            </div>

            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-2xl mb-2">📈</div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                Отчетность
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
