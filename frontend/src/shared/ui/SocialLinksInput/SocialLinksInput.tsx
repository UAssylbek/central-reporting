import type { SocialLinks } from "../../api/auth.api";

interface SocialLinksInputProps {
  value: SocialLinks;
  onChange: (value: SocialLinks) => void;
}

const SOCIAL_PLATFORMS = [
  {
    key: "telegram" as const,
    label: "Telegram",
    icon: "📱",
    placeholder: "@username",
  },
  {
    key: "whatsapp" as const,
    label: "WhatsApp",
    icon: "📞",
    placeholder: "+7 777 123 4567",
  },
  {
    key: "linkedin" as const,
    label: "LinkedIn",
    icon: "💼",
    placeholder: "linkedin.com/in/username",
  },
  {
    key: "facebook" as const,
    label: "Facebook",
    icon: "👥",
    placeholder: "facebook.com/username",
  },
  {
    key: "instagram" as const,
    label: "Instagram",
    icon: "📷",
    placeholder: "@username",
  },
  {
    key: "twitter" as const,
    label: "Twitter/X",
    icon: "🐦",
    placeholder: "@username",
  },
];

export function SocialLinksInput({ value, onChange }: SocialLinksInputProps) {
  const handleChange = (key: keyof SocialLinks, inputValue: string) => {
    onChange({
      ...value,
      [key]: inputValue,
    });
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300">
        Социальные сети и мессенджеры
      </label>

      <div className="space-y-3">
        {SOCIAL_PLATFORMS.map((platform) => (
          <div key={platform.key} className="flex items-center gap-2">
            <span className="text-2xl w-8 flex-shrink-0">{platform.icon}</span>
            <div className="flex-1">
              <input
                type="text"
                value={value[platform.key] || ""}
                onChange={(e) => handleChange(platform.key, e.target.value)}
                placeholder={platform.placeholder}
                className="w-full px-4 py-2.5 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
                {platform.label}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
