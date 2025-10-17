// frontend/src/shared/api/hooks/useAuth.ts
import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryResult,
  type UseMutationResult,
} from '@tanstack/react-query';
import { authApi } from '../auth.api';
import type { User, LoginRequest, ChangePasswordRequest, LoginResponse } from '../auth.api';

/**
 * Query keys для auth
 */
export const authKeys = {
  all: ['auth'] as const,
  me: () => [...authKeys.all, 'me'] as const,
};

/**
 * Hook для получения текущего пользователя
 *
 * @param enabled - выполнять ли запрос (по умолчанию true)
 * @returns React Query результат с данными текущего пользователя
 *
 * @example
 * ```tsx
 * function UserProfile() {
 *   const { data: user, isLoading } = useCurrentUser();
 *
 *   if (isLoading) return <Spinner />;
 *
 *   return (
 *     <div>
 *       <h1>{user.full_name}</h1>
 *       <p>{user.role}</p>
 *     </div>
 *   );
 * }
 * ```
 */
export function useCurrentUser(enabled = true): UseQueryResult<User> {
  return useQuery({
    queryKey: authKeys.me(),
    queryFn: () => authApi.me(),
    enabled: enabled && authApi.isAuthenticated(),
    staleTime: 5 * 60 * 1000, // 5 минут
    retry: false, // Не повторять при 401
  });
}

/**
 * Hook для входа в систему
 *
 * @returns Mutation для login с автоматическим обновлением кэша пользователя
 *
 * @example
 * ```tsx
 * function LoginForm() {
 *   const login = useLogin();
 *   const navigate = useNavigate();
 *
 *   const handleSubmit = async (credentials: LoginRequest) => {
 *     try {
 *       const response = await login.mutateAsync(credentials);
 *
 *       if (response.require_password_change) {
 *         navigate('/change-password');
 *       } else {
 *         navigate('/dashboard');
 *       }
 *     } catch (error) {
 *       toast.error(error.message);
 *     }
 *   };
 *
 *   return <LoginFormUI onSubmit={handleSubmit} isLoading={login.isPending} />;
 * }
 * ```
 */
export function useLogin(): UseMutationResult<LoginResponse, Error, LoginRequest> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: LoginRequest) => authApi.login(credentials),
    onSuccess: (response) => {
      // Сохраняем пользователя в кэше
      queryClient.setQueryData(authKeys.me(), response.user);
    },
  });
}

/**
 * Hook для выхода из системы
 *
 * @returns Mutation для logout с очисткой всего кэша
 *
 * @example
 * ```tsx
 * function LogoutButton() {
 *   const logout = useLogout();
 *   const navigate = useNavigate();
 *
 *   const handleLogout = async () => {
 *     await logout.mutateAsync();
 *     navigate('/login');
 *   };
 *
 *   return <Button onClick={handleLogout}>Выйти</Button>;
 * }
 * ```
 */
export function useLogout(): UseMutationResult<void, Error, void> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      // Очищаем весь кэш при выходе
      queryClient.clear();
    },
  });
}

/**
 * Hook для смены пароля
 *
 * @returns Mutation для смены пароля с обновлением данных пользователя
 *
 * @example
 * ```tsx
 * function ChangePasswordForm() {
 *   const changePassword = useChangePassword();
 *
 *   const handleSubmit = async (data: ChangePasswordRequest) => {
 *     try {
 *       await changePassword.mutateAsync(data);
 *       toast.success('Пароль успешно изменен');
 *       navigate('/dashboard');
 *     } catch (error) {
 *       toast.error(error.message);
 *     }
 *   };
 *
 *   return <PasswordFormUI onSubmit={handleSubmit} isLoading={changePassword.isPending} />;
 * }
 * ```
 */
export function useChangePassword(): UseMutationResult<void, Error, ChangePasswordRequest> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ChangePasswordRequest) => authApi.changePassword(data),
    onSuccess: async () => {
      // Обновляем данные пользователя после смены пароля
      // authApi.changePassword уже вызывает me() внутри
      await queryClient.invalidateQueries({ queryKey: authKeys.me() });
    },
  });
}

/**
 * Hook для проверки авторизации
 *
 * @returns Объект с информацией о статусе авторизации
 *
 * @example
 * ```tsx
 * function ProtectedRoute({ children }) {
 *   const { isAuthenticated, isLoading } = useAuth();
 *
 *   if (isLoading) return <Spinner />;
 *   if (!isAuthenticated) return <Navigate to="/login" />;
 *
 *   return children;
 * }
 * ```
 */
export function useAuth() {
  const { data: user, isLoading, error } = useCurrentUser();

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
  };
}
