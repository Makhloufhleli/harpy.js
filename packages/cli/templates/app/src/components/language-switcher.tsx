'use client';

import { useI18n } from '@harpy-js/core/client';
import { useState } from 'react';

/**
 * Language Switcher Component
 *
 * Uses the useI18n hook to switch locales.
 * The hook automatically detects whether to use query params or header mode.
 */
export function LanguageSwitcher() {
  const { switchLocale } = useI18n();
  const [isLoading, setIsLoading] = useState(false);

  const handleSwitchLocale = (locale: string) => {
    setIsLoading(true);
    (switchLocale(locale) as Promise<void>)
      .then(() => {
        // Page will reload, so this won't execute
      })
      .catch((error: unknown) => {
        console.error('Failed to switch locale:', error);
        setIsLoading(false);
      });
  };

  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={() => {
          handleSwitchLocale('en');
        }}
        disabled={isLoading}
        className="px-3 py-1 rounded bg-amber-600 hover:bg-amber-700 disabled:bg-amber-800 text-white font-medium transition-colors"
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => {
          handleSwitchLocale('fr');
        }}
        disabled={isLoading}
        className="px-3 py-1 rounded bg-amber-600 hover:bg-amber-700 disabled:bg-amber-800 text-white font-medium transition-colors"
      >
        FR
      </button>
    </div>
  );
}
