// frontend/src/shared/ui/ConfirmModal/ConfirmModal.tsx
import { Modal } from "../Modal/Modal";
import { Button } from "../Button/Button";

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
  isLoading?: boolean;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Подтвердить",
  cancelText = "Отмена",
  variant = "danger",
  isLoading = false,
}: ConfirmModalProps) {
  const variantColors = {
    danger: "bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800",
    warning: "bg-yellow-600 hover:bg-yellow-700 dark:bg-yellow-700 dark:hover:bg-yellow-800",
    info: "bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800",
  };

  const variantIcons = {
    danger: "⚠️",
    warning: "⚡",
    info: "ℹ️",
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-6">
        {/* Icon */}
        <div className="flex items-center justify-center w-16 h-16 mx-auto rounded-full bg-red-100 dark:bg-red-900/20">
          <span className="text-3xl">{variantIcons[variant]}</span>
        </div>

        {/* Message */}
        <p className="text-center text-gray-600 dark:text-zinc-400">{message}</p>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            {cancelText}
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isLoading}
            className={variantColors[variant]}
          >
            {isLoading ? "Загрузка..." : confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}