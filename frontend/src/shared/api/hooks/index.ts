// frontend/src/shared/api/hooks/index.ts

// Auth hooks
export {
  useCurrentUser,
  useLogin,
  useLogout,
  useChangePassword,
  useAuth,
  authKeys,
} from './useAuth';

// Users hooks
export {
  useUsers,
  useUser,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
  useUploadAvatar,
  useDeleteAvatar,
  useOrganizations,
  userKeys,
} from './useUsers';
