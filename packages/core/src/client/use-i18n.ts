/**
 * React hook for i18n locale switching (Client-side only)
 *
 * This hook provides a Next.js-style server action pattern for locale switching.
 * It posts form data to the server, which sets the locale cookie and returns
 * a redirect URL. Then we navigate to that URL to reload with the new locale.
 *
 * @example
 * ```tsx
 * import { useI18n } from '@harpy-js/core/client';
 *
 * function MyComponent() {
 *   const { switchLocale, isLoading } = useI18n();
 *   return (
 *     <>
 *       <button onClick={() => switchLocale('fr')} disabled={isLoading}>
 *         {isLoading ? 'Loading...' : 'French'}
 *       </button>
 *     </>
 *   );
 * }
 * ```
 */

'use client';

import { useState } from 'react';

interface UseI18nReturn {
  switchLocale: (locale: string) => Promise<void>;
  isLoading: boolean;
}

export function useI18n(): UseI18nReturn {
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Switch to a new locale by posting to the server endpoint
   * The server will set the locale cookie and return a redirect URL
   */
  const switchLocale = async (locale: string): Promise<void> => {
    if (typeof window === 'undefined') return;

    setIsLoading(true);

    try {
      console.log('[useI18n] Switching locale to:', locale);

      // Create FormData to send as application/x-www-form-urlencoded
      const formData = new URLSearchParams();
      formData.append('locale', locale);
      formData.append('redirect', window.location.pathname + window.location.search);

      const response = await fetch('/api/i18n/switch-locale', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
        redirect: 'manual', // Don't follow redirects automatically
      });

      console.log('[useI18n] Response status:', response.status);

      // Server will return 302 redirect, which fetch sees as status 0 with 'opaqueredirect' type
      // Or it might return the redirect URL in the response body
      if (response.type === 'opaqueredirect' || response.status === 302 || response.status === 0) {
        // Cookie is set, just reload the current page
        window.location.reload();
      } else if (response.ok || response.redirected) {
        // If we got a response, reload
        window.location.reload();
      } else {
        console.error('[useI18n] Unexpected response:', response.status);
        // Try to reload anyway since cookie might be set
        window.location.reload();
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error('[useI18n] Error:', errorMsg);
      // Even on error, try to reload in case cookie was set
      window.location.reload();
    }
  };

  return {
    switchLocale,
    isLoading,
  };
}
