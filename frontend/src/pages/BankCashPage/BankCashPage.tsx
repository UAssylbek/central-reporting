// frontend/src/pages/BankCashPage/BankCashPage.tsx
import { Card } from "../../shared/ui/Card/Card";

export function BankCashPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Банк и касса
        </h1>
        <p className="mt-2 text-gray-600 dark:text-zinc-400">
          Учет банковских операций и кассовых документов
        </p>
      </div>

      {/* Content */}
      <Card>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-2xl flex items-center justify-center mb-6">
            <span className="text-4xl">💳</span>
          </div>

          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Раздел в разработке
          </h2>

          <p className="text-gray-600 dark:text-zinc-400 max-w-md">
            Здесь будет учет банковских операций и кассы
          </p>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-2xl">
            <div className="p-4 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg">
              <div className="text-2xl mb-2">🏦</div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                Банковские счета
              </div>
            </div>

            <div className="p-4 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg">
              <div className="text-2xl mb-2">💰</div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                Касса
              </div>
            </div>

            <div className="p-4 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg">
              <div className="text-2xl mb-2">📈</div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                Движение средств
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
