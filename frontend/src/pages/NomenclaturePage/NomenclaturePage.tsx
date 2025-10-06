// frontend/src/pages/NomenclaturePage/NomenclaturePage.tsx
import { Card } from "../../shared/ui/Card/Card";

export function NomenclaturePage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Номенклатура и склад
        </h1>
        <p className="mt-2 text-gray-600 dark:text-zinc-400">
          Складской учет и управление номенклатурой
        </p>
      </div>

      {/* Content */}
      <Card>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6">
            <span className="text-4xl">📦</span>
          </div>

          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Раздел в разработке
          </h2>

          <p className="text-gray-600 dark:text-zinc-400 max-w-md">
            Здесь будет складской учет и управление номенклатурой товаров
          </p>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-2xl">
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="text-2xl mb-2">📋</div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                Номенклатура
              </div>
            </div>

            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="text-2xl mb-2">🏭</div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                Склад
              </div>
            </div>

            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="text-2xl mb-2">📊</div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                Остатки ТМЗ
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
