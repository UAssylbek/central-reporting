// frontend/src/pages/CentralizationPage/CentralizationPage.tsx
import { Card } from "../../shared/ui/Card/Card";

export function CentralizationPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Централизация
        </h1>
        <p className="mt-2 text-gray-600 dark:text-zinc-400">
          Функции централизованной отчетности
        </p>
      </div>

      {/* Content */}
      <Card>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6">
            <span className="text-4xl">🏛️</span>
          </div>

          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Раздел в разработке
          </h2>

          <p className="text-gray-600 dark:text-zinc-400 max-w-md">
            Здесь будут функции централизованной отчетности и аналитики
          </p>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-2xl">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-2xl mb-2">📊</div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                Сводные отчеты
              </div>
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-2xl mb-2">📈</div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                Аналитика
              </div>
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-2xl mb-2">🔄</div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                Консолидация
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
