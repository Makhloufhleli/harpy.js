'use client';

import { useI18n } from '@hepta-solutions/harpy-core/client';

/**
 * Language Switcher Component
 * 
 * A simple language switcher that uses the i18n hook
 * to switch between locales.
 */
export function LanguageSwitcher() {
  const { switchLocale, isLoading } = useI18n();

  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          void switchLocale('en');
        }}
        disabled={isLoading}
        className="px-3 py-1 rounded bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50"
      >
        English
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          void switchLocale('fr');
        }}
        disabled={isLoading}
        className="px-3 py-1 rounded bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50"
      >
        Français
      </button>
    </div>
  );
}
