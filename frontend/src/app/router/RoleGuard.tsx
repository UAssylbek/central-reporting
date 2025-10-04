// frontend/src/app/router/RoleGuard.tsx
import { Navigate, Outlet } from "react-router-dom";

type UserRole = "admin" | "moderator" | "user";

interface RoleGuardProps {
  /**
   * Массив разрешенных ролей для доступа к роуту
   * @example ['admin'] - только администратор
   * @example ['admin', 'moderator'] - администратор или модератор
   */
  allowedRoles: UserRole[];

  /**
   * Путь для редиректа если доступ запрещен
   * @default '/home'
   */
  redirectTo?: string;
}

/**
 * Компонент для проверки ролей пользователя
 * Заменяет старые RequireAdmin, RequireAdminOrModerator, RequireModerator
 *
 * @example
 * // Только для администраторов
 * <Route element={<RoleGuard allowedRoles={['admin']} />}>
 *   <Route path="/admin" element={<AdminPage />} />
 * </Route>
 *
 * @example
 * // Для администраторов и модераторов
 * <Route element={<RoleGuard allowedRoles={['admin', 'moderator']} />}>
 *   <Route path="/users" element={<UsersPage />} />
 * </Route>
 */
export function RoleGuard({
  allowedRoles,
  redirectTo = "/home",
}: RoleGuardProps) {
  // Получаем пользователя из localStorage
  // Потом заменим на useAuth hook
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;

  // Если пользователя нет - редирект
  if (!user) {
    return <Navigate to={redirectTo} replace />;
  }

  // Проверяем роль
  const hasAccess = allowedRoles.includes(user.role);

  if (!hasAccess) {
    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
}
