/**
 * React hook for i18n locale switching (Client-side only)
 *
 * This hook provides a simple way to switch locales from any component
 * (buttons, dropdowns, selects, etc.)
 *
 * @example
 * ```tsx
 * import { useI18n } from '@hepta-solutions/harpy-core/client';
 *
 * function MyComponent() {
 *   const { switchLocale, isLoading } = useI18n();
 *   return <button onClick={() => switchLocale('fr')}>French</button>;
 * }
 * ```
 */

'use client';

import { useState } from 'react';

interface SwitchLocaleResponse {
  success: boolean;
  locale: string;
  redirectUrl: string;
}

interface UseI18nReturn {
  switchLocale: (locale: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export function useI18n(): UseI18nReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const switchLocale = async (locale: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/i18n/switch-locale', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ locale }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = (await response.json()) as SwitchLocaleResponse;

      if (data.success) {
        // Navigate to the new URL (server will handle cookie and locale detection)
        window.location.href = data.redirectUrl;
      } else {
        throw new Error('Failed to switch locale');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      setIsLoading(false);
      console.error('Failed to switch locale:', err);
    }
  };

  return {
    switchLocale,
    isLoading,
    error,
  };
}
