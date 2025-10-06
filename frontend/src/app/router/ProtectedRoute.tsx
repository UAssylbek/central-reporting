// frontend/src/app/router/ProtectedRoute.tsx
import { Navigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { authApi } from "../../shared/api/auth.api";
import { Spinner } from "../../shared/ui/Spinner/Spinner";

/**
 * Компонент для защиты роутов
 * Проверяет авторизацию и валидирует токен
 */
export function ProtectedRoute() {
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    // Проверяем наличие токена
    if (!authApi.isAuthenticated()) {
      setIsAuthenticated(false);
      setIsChecking(false);
      return;
    }

    try {
      // Проверяем валидность токена через API
      await authApi.me();
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Auth validation error:", error);
      // Токен невалиден - очищаем и редиректим
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setIsAuthenticated(false);
    } finally {
      setIsChecking(false);
    }
  };

  // Показываем loader пока проверяем
  if (isChecking) {
    return <Spinner fullScreen text="Проверка авторизации..." />;
  }

  // Если не авторизован - редирект на login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Авторизован - показываем защищённый контент
  return <Outlet />;
}
