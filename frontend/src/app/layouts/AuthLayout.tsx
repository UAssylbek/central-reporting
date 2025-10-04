// frontend/src/app/layouts/AuthLayout.tsx
import { Outlet } from "react-router-dom";
import { ThemeSwitcher } from "../../shared/components/ThemeSwitcher/ThemeSwitcher";

/**
 * Layout для страниц авторизации (Welcome, Login)
 * Минималистичный дизайн с переключателем темы
 */
export function AuthLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-zinc-900 dark:to-zinc-800 transition-colors duration-300">
      {/* Theme Switcher в углу */}
      <div className="absolute top-4 right-4 z-10">
        <ThemeSwitcher />
      </div>

      {/* Content */}
      <Outlet />
    </div>
  );
}
