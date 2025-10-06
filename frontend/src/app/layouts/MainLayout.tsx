// frontend/src/app/layouts/MainLayout.tsx
import { Outlet, Link, useNavigate } from "react-router-dom";
import { ThemeSwitcher } from "../../shared/components/ThemeSwitcher/ThemeSwitcher";
import { authApi } from "../../shared/api/auth.api";

/**
 * Основной layout для авторизованных пользователей
 * Включает шапку с навигацией и место для контента
 */
export function MainLayout() {
  const navigate = useNavigate();
  const user = authApi.getCurrentUser();

  const handleLogout = async () => {
    try {
      await authApi.logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      // В случае ошибки всё равно редиректим на login
      navigate("/login");
    }
  };

  // Проверка доступа к управлению пользователями
  const canManageUsers = user?.role === "admin" || user?.role === "moderator";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-900 transition-colors duration-300">
      {/* Header */}
      <header className="bg-white dark:bg-zinc-800 border-b border-gray-200 dark:border-zinc-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Navigation */}
            <div className="flex items-center gap-8">
              <Link to="/home" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">Ц</span>
                </div>
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  Централизация
                </span>
              </Link>

              <nav className="hidden md:flex items-center gap-6">
                <Link
                  to="/home"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Главная
                </Link>
                <Link
                  to="/dashboard"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Dashboard
                </Link>

                {/* Управление пользователями - только для admin и moderator */}
                {canManageUsers && (
                  <Link
                    to="/users"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    Пользователи
                  </Link>
                )}
              </nav>
            </div>

            {/* User & Theme */}
            <div className="flex items-center gap-4">
              {user && (
                <div className="hidden sm:flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 dark:text-blue-400 font-semibold">
                      {user.full_name?.[0] || user.username?.[0] || "U"}
                    </span>
                  </div>
                  <span className="font-medium">
                    {user.full_name || user.username}
                  </span>
                </div>
              )}

              <ThemeSwitcher />

              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded-lg transition-colors"
              >
                Выйти
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}
