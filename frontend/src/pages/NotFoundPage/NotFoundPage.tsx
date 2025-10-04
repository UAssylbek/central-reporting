// frontend/src/pages/NotFoundPage/NotFoundPage.tsx
import { useNavigate } from "react-router-dom";
import { Button } from "../../shared/ui/Button/Button";

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-white dark:bg-zinc-900">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-blue-500 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
          Страница не найдена
        </h2>
        <p className="text-gray-600 dark:text-zinc-400 mb-8">
          Запрашиваемая страница не существует или была удалена
        </p>
        <Button
          variant="primary"
          onClick={() => navigate("/")}
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
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
          }
        >
          Вернуться на главную
        </Button>
      </div>
    </div>
  );
}
