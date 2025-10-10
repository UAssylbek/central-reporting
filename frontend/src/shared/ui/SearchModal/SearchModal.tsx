// frontend/src/shared/ui/SearchModal/SearchModal.tsx
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

export interface SearchOption {
  id: string | number;
  name: string;
  description?: string;
}

export interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (option: SearchOption) => void;
  title: string;
  options: SearchOption[];
  searchPlaceholder?: string;
  noResultsText?: string;
}

export function SearchModal({
  isOpen,
  onClose,
  onSelect,
  title,
  options,
  searchPlaceholder = "Введите для поиска...",
  noResultsText = "Ничего не найдено",
}: SearchModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredOptions, setFilteredOptions] = useState<SearchOption[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredOptions(options);
    } else {
      setFilteredOptions(
        options.filter((option) =>
          option.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
  }, [searchTerm, options]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleSelect = (option: SearchOption) => {
    onSelect(option);
    setSearchTerm("");
    onClose();
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[80vh] bg-white dark:bg-zinc-800 rounded-xl shadow-2xl flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-zinc-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors"
            type="button"
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Search Input */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-zinc-700">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent"
            />
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar">
          {filteredOptions.length > 0 ? (
            <div className="space-y-2">
              {filteredOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleSelect(option)}
                  className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors group"
                  type="button"
                >
                  <div className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                    {option.name}
                  </div>
                  {option.description && (
                    <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      {option.description}
                    </div>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 mb-4 text-gray-300 dark:text-gray-600">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <p className="text-gray-500 dark:text-gray-400 font-medium">
                {noResultsText}
              </p>
              {searchTerm && (
                <p className="mt-2 text-sm text-gray-400 dark:text-gray-500">
                  По запросу "{searchTerm}" ничего не найдено
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-zinc-700 flex items-center justify-between">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Найдено: {filteredOptions.length} из {options.length}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-zinc-700 rounded-lg hover:bg-gray-200 dark:hover:bg-zinc-600 transition-colors"
            type="button"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
