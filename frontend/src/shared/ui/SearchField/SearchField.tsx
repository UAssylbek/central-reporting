// frontend/src/shared/ui/SearchField/SearchField.tsx
import { useState, useEffect } from "react";
import { SearchModal, type SearchOption } from "../SearchModal/SearchModal";

export interface SearchConfig {
  modalTitle: string;
  searchPlaceholder: string;
  noResultsText?: string;
  loadOptions: () => Promise<SearchOption[]> | SearchOption[];
}

export interface SearchFieldProps {
  label: string;
  value: string;
  onChange: (value: string, selectedId?: string | number) => void;
  searchConfig: SearchConfig;
  required?: boolean;
  error?: string;
  description?: string;
}

export function SearchField({
  label,
  value,
  onChange,
  searchConfig,
  required = false,
  error,
  description,
}: SearchFieldProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [options, setOptions] = useState<SearchOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchOption[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Загрузка опций при первом открытии
  const loadOptions = async () => {
    if (options.length > 0) return;

    setIsLoading(true);
    try {
      const result = await searchConfig.loadOptions();
      const optionsArray = Array.isArray(result) ? result : [];
      setOptions(optionsArray);
    } catch (error) {
      console.error("Ошибка загрузки опций:", error);
      setOptions([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Автодополнение при вводе
  useEffect(() => {
    if (value && options.length > 0) {
      const filtered = options
        .filter((option) =>
          option.name.toLowerCase().includes(value.toLowerCase())
        )
        .slice(0, 5);
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [value, options]);

  const handleOpenModal = async () => {
    await loadOptions();
    setIsModalOpen(true);
  };

  const handleSelect = (option: SearchOption) => {
    onChange(option.name, option.id);
    setShowSuggestions(false);
  };

  const handleInputChange = async (newValue: string) => {
    onChange(newValue);

    // Автоматическая загрузка опций при первом вводе
    if (newValue.length > 0 && options.length === 0) {
      await loadOptions();
    }
  };

  const handleShowAll = async () => {
    await loadOptions();
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-2">
      {/* Label */}
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>

      {/* Input with dropdown button */}
      <div className="relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={value}
              onChange={(e) => handleInputChange(e.target.value)}
              onFocus={() =>
                value && suggestions.length > 0 && setShowSuggestions(true)
              }
              placeholder={searchConfig.searchPlaceholder}
              className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-zinc-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent ${
                error
                  ? "border-red-300 dark:border-red-600 focus:ring-red-500"
                  : "border-gray-300 dark:border-zinc-600 focus:ring-blue-500 dark:focus:ring-blue-600"
              }`}
            />

            {/* Autocomplete suggestions */}
            {showSuggestions && (
              <div className="absolute z-10 w-full mt-1 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg shadow-lg max-h-60 overflow-y-auto custom-scrollbar">
                {suggestions.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => handleSelect(option)}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-zinc-700 first:rounded-t-lg last:rounded-b-lg transition-colors"
                  >
                    <div className="font-medium text-gray-900 dark:text-white">
                      {option.name}
                    </div>
                    {option.description && (
                      <div className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                        {option.description}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleOpenModal}
            disabled={isLoading}
            className="px-4 py-2 bg-gray-100 dark:bg-zinc-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-zinc-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Открыть список"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
            ) : (
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
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            )}
          </button>
        </div>

        {/* Helper text or error */}
        {(description || error) && (
          <div
            className={`mt-1 text-sm ${
              error
                ? "text-red-600 dark:text-red-400"
                : "text-gray-600 dark:text-gray-400"
            }`}
          >
            {error || description}
          </div>
        )}

        {/* Show all button */}
        {!value && (
          <div className="mt-2">
            <button
              type="button"
              onClick={handleShowAll}
              disabled={isLoading}
              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline disabled:opacity-50"
            >
              {isLoading ? "Загрузка..." : "Показать все"}
            </button>
          </div>
        )}
      </div>

      {/* Search Modal */}
      <SearchModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelect={handleSelect}
        title={searchConfig.modalTitle}
        options={options}
        searchPlaceholder={searchConfig.searchPlaceholder}
        noResultsText={searchConfig.noResultsText}
      />
    </div>
  );
}
