import { useRef, useState } from "react";

interface AvatarUploadProps {
  currentAvatar?: string;
  fullName?: string;
  onUpload: (file: File) => Promise<void>;
  onRemove?: () => Promise<void>;
  disabled?: boolean;
}

export function AvatarUpload({
  currentAvatar,
  fullName = "User",
  onUpload,
  onRemove,
  disabled = false,
}: AvatarUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const getInitials = () => {
    return fullName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Проверка типа файла
    if (!file.type.startsWith("image/")) {
      alert("Пожалуйста, выберите изображение");
      return;
    }

    // Проверка размера (макс 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Размер файла не должен превышать 5MB");
      return;
    }

    // Создаем превью
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Загружаем файл
    setUploading(true);
    try {
      await onUpload(file);
    } catch (error) {
      console.error("Failed to upload avatar:", error);
      alert("Не удалось загрузить аватар");
      setPreview(null);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    if (!onRemove) return;

    setUploading(true);
    try {
      await onRemove();
      setPreview(null);
    } catch (error) {
      console.error("Failed to remove avatar:", error);
      alert("Не удалось удалить аватар");
    } finally {
      setUploading(false);
    }
  };

  const avatarSrc = preview || currentAvatar;

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300">
        Фото профиля
      </label>

      <div className="flex items-center gap-4">
        {/* Avatar Display */}
        <div className="relative">
          {avatarSrc ? (
            <img
              src={avatarSrc}
              alt={fullName}
              className="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-zinc-700 shadow-lg"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl border-4 border-white dark:border-zinc-700 shadow-lg">
              {getInitials()}
            </div>
          )}

          {uploading && (
            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            disabled={disabled || uploading}
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || uploading}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-lg transition-colors flex items-center gap-2"
          >
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
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            {avatarSrc ? "Изменить фото" : "Загрузить фото"}
          </button>

          {avatarSrc && onRemove && (
            <button
              type="button"
              onClick={handleRemove}
              disabled={disabled || uploading}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white rounded-lg transition-colors flex items-center gap-2"
            >
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
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              Удалить фото
            </button>
          )}
        </div>
      </div>

      <p className="text-sm text-gray-500 dark:text-zinc-400">
        Рекомендуется квадратное изображение. Максимальный размер: 5MB
      </p>
    </div>
  );
}
