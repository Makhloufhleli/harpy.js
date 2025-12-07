/**
 * React hook for i18n locale switching (Client-side only)
 *
 * This hook provides a simple way to switch locales from any component
 * (buttons, dropdowns, selects, etc.)
 *
 * The hook updates the URL with the selected locale and reloads the page.
 * The server-side interceptor will automatically set the cookie based on the URL.
 *
 * When used in a component, it automatically injects the language-aware navigation script.
 *
 * @example
 * ```tsx
 * import { useI18n } from '@harpy-js/core/client';
 *
 * function MyComponent() {
 *   const { switchLocale } = useI18n();
 *   return <button onClick={() => switchLocale('fr')}>French</button>;
 * }
 * ```
 */

"use client";

import { useEffect } from "react";

interface UseI18nReturn {
  switchLocale: (locale: string) => void;
  getCurrentLocale: () => string | null;
  buildUrl: (path: string, locale?: string) => string;
}

export function useI18n(): UseI18nReturn {
  // Register that this component uses i18n, so the navigation script gets injected
  useEffect(() => {
    // Mark that i18n is being used in this render
    if (
      typeof window !== "undefined" &&
      !(window as any).__HARPY_I18N_INITIALIZED__
    ) {
      (window as any).__HARPY_I18N_INITIALIZED__ = true;

      // Inject language-aware navigation script
      const script = document.createElement("script");
      script.textContent = `
        (function() {
          if (window.__HARPY_I18N_NAV_INSTALLED__) return;
          window.__HARPY_I18N_NAV_INSTALLED__ = true;
          
          document.addEventListener('click', function(e) {
            var target = e.target;
            while (target && target.tagName !== 'A') {
              target = target.parentElement;
            }
            if (target && target.tagName === 'A' && target.href) {
              var url = new URL(target.href, window.location.origin);
              var currentLang = new URLSearchParams(window.location.search).get('lang');
              if (currentLang && url.origin === window.location.origin && !url.searchParams.has('lang')) {
                url.searchParams.set('lang', currentLang);
                target.href = url.toString();
              }
            }
          });
        })();
      `;
      document.head.appendChild(script);
    }
  }, []);

  /**
   * Switch to a new locale by updating the URL and reloading the page
   */
  const switchLocale = (locale: string): void => {
    if (typeof window === "undefined") return;

    const url = new URL(window.location.href);
    url.searchParams.set("lang", locale);
    window.location.href = url.toString();
  };

  /**
   * Get the current locale from the URL
   */
  const getCurrentLocale = (): string | null => {
    if (typeof window === "undefined") return null;

    const url = new URL(window.location.href);
    return url.searchParams.get("lang");
  };

  /**
   * Build a URL with the current locale preserved
   * Useful for navigation links that should maintain the language
   */
  const buildUrl = (path: string, locale?: string): string => {
    if (typeof window === "undefined") return path;

    const currentLocale = locale || getCurrentLocale();
    if (!currentLocale) return path;

    const url = new URL(path, window.location.origin);
    url.searchParams.set("lang", currentLocale);
    return url.pathname + url.search;
  };

  return {
    switchLocale,
    getCurrentLocale,
    buildUrl,
  };
}
