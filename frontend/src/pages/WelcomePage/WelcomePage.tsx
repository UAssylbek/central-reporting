// frontend/src/pages/WelcomePage/WelcomePage.tsx
import { useNavigate } from "react-router-dom";
import { Button } from "../../shared/ui/Button/Button";

export function WelcomePage() {
  const navigate = useNavigate();

  const advantages = [
    "Актуальные данные в реальном времени",
    "Автоматизированный сбор сведений",
    "Комплексный анализ работы учреждений",
    "Удобная группировка отчётов",
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Централизация отчётности
          </h1>

          <p className="text-lg text-gray-600 dark:text-zinc-400 max-w-2xl mx-auto">
            Единая система сбора и анализа отчётности государственных учреждений
            Казахстана
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {advantages.map((advantage, index) => (
            <div
              key={index}
              className="flex items-start gap-3 p-4 bg-white dark:bg-zinc-800 rounded-lg border border-gray-200 dark:border-zinc-700"
            >
              <div className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mt-0.5">
                <svg
                  className="w-4 h-4 text-blue-600 dark:text-blue-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <span className="text-gray-700 dark:text-zinc-300">
                {advantage}
              </span>
            </div>
          ))}
        </div>

        <div className="flex justify-center">
          <Button
            size="lg"
            className="cursor-pointer"
            onClick={() => navigate("/login")}
            rightIcon={
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
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            }
          >
            Войти в систему
          </Button>
        </div>

        {/* Footer Info */}
        <div className="mt-16 pt-8 border-t border-gray-200 dark:border-zinc-700">
          <div className="flex items-center justify-center gap-4 text-sm text-gray-500 dark:text-zinc-400">
            <span>© 2025 Централизация отчётности</span>
            <span>•</span>
            <span>Государственные учреждения Казахстана</span>
          </div>
        </div>
      </div>
    </div>
  );
}
