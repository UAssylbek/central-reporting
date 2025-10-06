// frontend/src/pages/AdministrationPage/AdministrationPage.tsx
import { Card } from "../../shared/ui/Card/Card";
import { Button } from "../../shared/ui/Button/Button";
import { useNavigate } from "react-router-dom";

export function AdministrationPage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Администрирование
        </h1>
        <p className="mt-2 text-gray-600 dark:text-zinc-400">
          Управление системой и пользователями
        </p>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">👥</span>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Управление пользователями
              </h3>
              <p className="text-sm text-gray-600 dark:text-zinc-400 mb-4">
                Создание, редактирование и управление правами пользователей
              </p>
              <Button size="sm" onClick={() => navigate("/users")}>
                Перейти →
              </Button>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">⚙️</span>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Настройки системы
              </h3>
              <p className="text-sm text-gray-600 dark:text-zinc-400 mb-4">
                Конфигурация и параметры системы
              </p>
              <Button size="sm" variant="secondary" disabled>
                В разработке
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Content */}
      <Card>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center mb-6">
            <span className="text-4xl">🛠️</span>
          </div>

          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Раздел администрирования
          </h2>

          <p className="text-gray-600 dark:text-zinc-400 max-w-md">
            Доступен только администраторам системы
          </p>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-2xl">
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <div className="text-2xl mb-2">👥</div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                Пользователи
              </div>
            </div>

            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <div className="text-2xl mb-2">🔐</div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                Права доступа
              </div>
            </div>

            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <div className="text-2xl mb-2">📊</div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                Логи системы
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
