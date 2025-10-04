// frontend/src/shared/utils/cn.ts

/**
 * Утилита для объединения классов (classnames)
 * Используется для условных классов в компонентах
 *
 * @example
 * cn('px-4 py-2', isActive && 'bg-blue-500', className)
 */
export function cn(
  ...classes: (string | boolean | undefined | null)[]
): string {
  return classes.filter(Boolean).join(" ");
}

// Также экспортируем как default для совместимости
export default cn;
