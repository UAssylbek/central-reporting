// frontend/src/pages/HomePage/HomePage.tsx
import { Card } from "../../shared/ui/Card/Card";
import { Badge } from "../../shared/ui/Badge/Badge";

export function HomePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Главная страница
        </h1>
        <p className="mt-2 text-gray-600 dark:text-zinc-400">
          Добро пожаловать в систему централизации отчётности
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card title="Отчёты">
          <p className="text-sm text-gray-600 dark:text-zinc-400">
            Доступные отчёты и формы
          </p>
          <div className="mt-4">
            <Badge variant="primary">12 активных</Badge>
          </div>
        </Card>

        <Card title="Организации">
          <p className="text-sm text-gray-600 dark:text-zinc-400">
            Подключенные организации
          </p>
          <div className="mt-4">
            <Badge variant="success">8 организаций</Badge>
          </div>
        </Card>

        <Card title="Уведомления">
          <p className="text-sm text-gray-600 dark:text-zinc-400">
            Новые сообщения и задачи
          </p>
          <div className="mt-4">
            <Badge variant="warning">3 новых</Badge>
          </div>
        </Card>
      </div>

      <Card>
        <div className="text-center py-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            🚀 Система готова к работе
          </h3>
          <p className="text-gray-600 dark:text-zinc-400">
            Здесь будет основной функционал приложения
          </p>
        </div>
      </Card>
    </div>
  );
}
