import { useState } from "react";

interface CustomFieldsProps {
  value: Record<string, unknown>;
  onChange: (value: Record<string, unknown>) => void;
}

interface FieldEntry {
  key: string;
  value: string;
}

export function CustomFields({ value, onChange }: CustomFieldsProps) {
  const [fields, setFields] = useState<FieldEntry[]>(() => {
    return Object.entries(value).map(([key, val]) => ({
      key,
      value: String(val),
    }));
  });

  const handleAdd = () => {
    setFields([...fields, { key: "", value: "" }]);
  };

  const handleRemove = (index: number) => {
    const newFields = fields.filter((_, i) => i !== index);
    setFields(newFields);
    updateValue(newFields);
  };

  const handleChangeKey = (index: number, key: string) => {
    const newFields = [...fields];
    newFields[index].key = key;
    setFields(newFields);
    updateValue(newFields);
  };

  const handleChangeValue = (index: number, val: string) => {
    const newFields = [...fields];
    newFields[index].value = val;
    setFields(newFields);
    updateValue(newFields);
  };

  const updateValue = (newFields: FieldEntry[]) => {
    const result: Record<string, unknown> = {};
    newFields.forEach((field) => {
      if (field.key.trim()) {
        result[field.key] = field.value;
      }
    });
    onChange(result);
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300">
        Дополнительные реквизиты
      </label>

      <div className="space-y-3">
        {fields.map((field, index) => (
          <div key={index} className="flex gap-2">
            <input
              type="text"
              value={field.key}
              onChange={(e) => handleChangeKey(index, e.target.value)}
              placeholder="Название поля"
              className="flex-1 px-4 py-2.5 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <input
              type="text"
              value={field.value}
              onChange={(e) => handleChangeValue(index, e.target.value)}
              placeholder="Значение"
              className="flex-1 px-4 py-2.5 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <button
              type="button"
              onClick={() => handleRemove(index)}
              className="px-3 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
              title="Удалить"
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
        ))}
      </div>

      <button
        type="button"
        onClick={handleAdd}
        className="w-full px-4 py-2.5 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors flex items-center justify-center gap-2"
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
            d="M12 4v16m8-8H4"
          />
        </svg>
        Добавить реквизит
      </button>

      <p className="text-sm text-gray-500 dark:text-zinc-400">
        Добавьте любые дополнительные поля, которые вам необходимы
      </p>
    </div>
  );
}
