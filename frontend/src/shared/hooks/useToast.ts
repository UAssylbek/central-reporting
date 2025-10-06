// frontend/src/shared/hooks/useToast.ts
import { useState, useCallback } from "react";
import type { ToastVariant } from "../ui/Toast/Toast";

export interface ToastState {
  message: string;
  variant: ToastVariant;
  id: number;
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastState[]>([]);

  const showToast = useCallback(
    (message: string, variant: ToastVariant = "info") => {
      const id = Date.now();
      setToasts((prev) => [...prev, { message, variant, id }]);
    },
    []
  );

  const hideToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const success = useCallback((message: string) => showToast(message, "success"), [showToast]);
  const error = useCallback((message: string) => showToast(message, "error"), [showToast]);
  const warning = useCallback((message: string) => showToast(message, "warning"), [showToast]);
  const info = useCallback((message: string) => showToast(message, "info"), [showToast]);

  return {
    toasts,
    showToast,
    hideToast,
    success,
    error,
    warning,
    info,
  };
}