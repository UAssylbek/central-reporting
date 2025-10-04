// frontend/src/pages/DashboardPage/DashboardPage.tsx
import { Card } from "../../shared/ui/Card/Card";
import { Spinner } from "../../shared/ui/Spinner/Spinner";

export function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Dashboard
        </h1>
        <p className="mt-2 text-gray-600 dark:text-zinc-400">
          Аналитика и статистика системы
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-zinc-400">
              Пользователей
            </p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
              245
            </p>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-zinc-400">Отчётов</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
              1,834
            </p>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-zinc-400">
              Организаций
            </p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
              42
            </p>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-zinc-400">
              За сегодня
            </p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
              18
            </p>
          </div>
        </Card>
      </div>

      <Card title="Активность">
        <div className="flex justify-center py-12">
          <Spinner text="Загрузка графиков..." />
        </div>
      </Card>
    </div>
  );
}
