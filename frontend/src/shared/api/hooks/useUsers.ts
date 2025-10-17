// frontend/src/shared/api/hooks/useUsers.ts
import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryResult,
  type UseMutationResult,
} from '@tanstack/react-query';
import { usersApi } from '../users.api';
import type {
  PaginationParams,
  PaginatedResponse,
  UserListItem,
} from '../types';
import type { User } from '../auth.api';
import type { CreateUserRequest, UpdateUserRequest } from '../users.api';

/**
 * Query keys для users
 */
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (params?: PaginationParams) => [...userKeys.lists(), params] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: number) => [...userKeys.details(), id] as const,
  organizations: () => [...userKeys.all, 'organizations'] as const,
};

/**
 * Hook для получения пагинированного списка пользователей
 *
 * @param params - параметры пагинации и сортировки
 * @returns React Query результат с пагинированным списком пользователей
 *
 * @example
 * ```tsx
 * function UsersList() {
 *   const { data, isLoading, error } = useUsers({ page: 1, page_size: 20 });
 *
 *   if (isLoading) return <Spinner />;
 *   if (error) return <Error message={error.message} />;
 *
 *   return (
 *     <div>
 *       {data.items.map(user => <UserCard key={user.id} user={user} />)}
 *       <Pagination total={data.total_pages} current={data.page} />
 *     </div>
 *   );
 * }
 * ```
 */
export function useUsers(
  params?: PaginationParams
): UseQueryResult<PaginatedResponse<UserListItem>> {
  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: () => usersApi.getUsers(params),
    staleTime: 3 * 60 * 1000, // 3 минуты - данные часто меняются
  });
}

/**
 * Hook для получения одного пользователя по ID
 *
 * @param id - ID пользователя
 * @param enabled - выполнять ли запрос (по умолчанию true)
 * @returns React Query результат с полными данными пользователя
 *
 * @example
 * ```tsx
 * function UserProfile({ userId }: { userId: number }) {
 *   const { data: user, isLoading } = useUser(userId);
 *
 *   if (isLoading) return <Spinner />;
 *
 *   return <UserDetails user={user} />;
 * }
 * ```
 */
export function useUser(
  id: number,
  enabled = true
): UseQueryResult<User> {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => usersApi.getById(id),
    enabled: enabled && id > 0,
    staleTime: 5 * 60 * 1000, // 5 минут - детальные данные меняются реже
  });
}

/**
 * Hook для создания пользователя
 *
 * @returns Mutation для создания пользователя с автоматической инвалидацией кэша
 *
 * @example
 * ```tsx
 * function CreateUserForm() {
 *   const createUser = useCreateUser();
 *
 *   const handleSubmit = async (data: CreateUserRequest) => {
 *     try {
 *       const result = await createUser.mutateAsync(data);
 *       toast.success(`Пользователь ${result.user.full_name} создан`);
 *     } catch (error) {
 *       toast.error(error.message);
 *     }
 *   };
 *
 *   return <UserForm onSubmit={handleSubmit} isLoading={createUser.isPending} />;
 * }
 * ```
 */
export function useCreateUser(): UseMutationResult<
  { user: User },
  Error,
  CreateUserRequest
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userData: CreateUserRequest) => usersApi.create(userData),
    onSuccess: () => {
      // Инвалидируем все списки пользователей
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.organizations() });
    },
  });
}

/**
 * Hook для обновления пользователя
 *
 * @returns Mutation для обновления пользователя с автоматической инвалидацией кэша
 *
 * @example
 * ```tsx
 * function EditUserForm({ userId }: { userId: number }) {
 *   const updateUser = useUpdateUser();
 *   const { data: user } = useUser(userId);
 *
 *   const handleSubmit = async (data: UpdateUserRequest) => {
 *     await updateUser.mutateAsync({ id: userId, data });
 *   };
 *
 *   return <UserForm initialData={user} onSubmit={handleSubmit} />;
 * }
 * ```
 */
export function useUpdateUser(): UseMutationResult<
  { user: User },
  Error,
  { id: number; data: UpdateUserRequest }
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => usersApi.update(id, data),
    onSuccess: (result, variables) => {
      // Обновляем конкретного пользователя в кэше
      queryClient.setQueryData(
        userKeys.detail(variables.id),
        result.user
      );

      // Инвалидируем списки пользователей
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}

/**
 * Hook для удаления пользователя
 *
 * @returns Mutation для удаления пользователя с автоматической инвалидацией кэша
 *
 * @example
 * ```tsx
 * function DeleteUserButton({ userId }: { userId: number }) {
 *   const deleteUser = useDeleteUser();
 *
 *   const handleDelete = async () => {
 *     if (confirm('Вы уверены?')) {
 *       await deleteUser.mutateAsync(userId);
 *     }
 *   };
 *
 *   return <Button onClick={handleDelete} loading={deleteUser.isPending}>Удалить</Button>;
 * }
 * ```
 */
export function useDeleteUser(): UseMutationResult<void, Error, number> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => usersApi.delete(id),
    onSuccess: (_, deletedId) => {
      // Удаляем пользователя из кэша
      queryClient.removeQueries({ queryKey: userKeys.detail(deletedId) });

      // Инвалидируем списки
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.organizations() });
    },
  });
}

/**
 * Hook для загрузки аватара
 *
 * @returns Mutation для загрузки аватара с автоматическим обновлением пользователя
 *
 * @example
 * ```tsx
 * function AvatarUpload({ userId }: { userId: number }) {
 *   const uploadAvatar = useUploadAvatar();
 *
 *   const handleFileChange = (file: File) => {
 *     uploadAvatar.mutate({ userId, file });
 *   };
 *
 *   return <FileInput onChange={handleFileChange} loading={uploadAvatar.isPending} />;
 * }
 * ```
 */
export function useUploadAvatar(): UseMutationResult<
  { avatar_url: string },
  Error,
  { userId: number; file: File }
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, file }) => usersApi.uploadAvatar(userId, file),
    onSuccess: (result, variables) => {
      // Обновляем avatar_url в кэше пользователя
      queryClient.setQueryData<User>(
        userKeys.detail(variables.userId),
        (oldData) => {
          if (!oldData) return oldData;
          return { ...oldData, avatar_url: result.avatar_url };
        }
      );

      // Инвалидируем списки для обновления аватара там тоже
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}

/**
 * Hook для удаления аватара
 *
 * @returns Mutation для удаления аватара с автоматическим обновлением пользователя
 */
export function useDeleteAvatar(): UseMutationResult<void, Error, number> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: number) => usersApi.deleteAvatar(userId),
    onSuccess: (_, userId) => {
      // Убираем avatar_url из кэша
      queryClient.setQueryData<User>(userKeys.detail(userId), (oldData) => {
        if (!oldData) return oldData;
        return { ...oldData, avatar_url: undefined };
      });

      // Инвалидируем списки
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}

/**
 * Hook для получения списка организаций
 *
 * @returns React Query результат со списком организаций
 */
export function useOrganizations() {
  return useQuery({
    queryKey: userKeys.organizations(),
    queryFn: () => usersApi.getOrganizations(),
    staleTime: 10 * 60 * 1000, // 10 минут - организации меняются редко
  });
}
