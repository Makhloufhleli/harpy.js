import { useState, useEffect } from 'react';
import { navigate } from '@harpy-js/core/client';

export interface I18nConfig {
  defaultLocale: string;
  locales: string[];
  urlPattern: 'query' | 'path' | 'header' | 'cookie';
  queryParam?: string;
  cookieName?: string;
}

export interface UseI18nReturn {
  /** Current locale */
  locale: string;
  /** Available locales */
  locales: string[];
  /** Default locale */
  defaultLocale: string;
  /** Switch to a different locale */
  setLocale: (newLocale: string) => void;
  /** Check if locale is available */
  isLocaleAvailable: (locale: string) => boolean;
}

/**
 * Hook for managing i18n locale switching on the client side.
 * 
 * This hook respects the i18n middleware configuration and triggers
 * server-side locale changes by navigating with the appropriate pattern:
 * - 'query': Updates URL query parameter (?lang=newLocale)
 * - 'path': Updates URL path (/newLocale/...)
 * - 'cookie': Sets cookie and reloads page
 * - 'header': Falls back to cookie (headers can't be set for navigation)
 * 
 * @example
 * ```tsx
 * function LanguageSwitcher() {
 *   const { locale, locales, setLocale } = useI18n();
 *   
 *   return (
 *     <select value={locale} onChange={(e) => setLocale(e.target.value)}>
 *       {locales.map(loc => (
 *         <option key={loc} value={loc}>{loc}</option>
 *       ))}
 *     </select>
 *   );
 * }
 * ```
 */
export function useI18n(): UseI18nReturn {
  // Get i18n config injected by server
  const config = getI18nConfig();
  
  // Get current locale from DOM or URL
  const [locale, setLocaleState] = useState<string>(() => getCurrentLocale(config));
  
  // Update locale when URL changes (for SPA navigation)
  useEffect(() => {
    const handlePopState = () => {
      setLocaleState(getCurrentLocale(config));
    };
    
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [config]);
  
  const setLocale = (newLocale: string) => {
    if (!config.locales.includes(newLocale)) {
      console.warn(`[useI18n] Locale "${newLocale}" is not in the available locales list`);
      return;
    }
    
    if (newLocale === locale) {
      return; // No change needed
    }
    
    // Switch locale based on URL pattern
    switch (config.urlPattern) {
      case 'query':
        switchLocaleViaQuery(newLocale, config);
        break;
        
      case 'path':
        switchLocaleViaPath(newLocale, config);
        break;
        
      case 'header':
      case 'cookie':
        // For header pattern, we use cookie as fallback for client-side persistence
        switchLocaleViaCookie(newLocale, config);
        break;
        
      default:
        console.error(`[useI18n] Unknown URL pattern: ${config.urlPattern}`);
    }
  };
  
  const isLocaleAvailable = (locale: string): boolean => {
    return config.locales.includes(locale);
  };
  
  return {
    locale,
    locales: config.locales,
    defaultLocale: config.defaultLocale,
    setLocale,
    isLocaleAvailable,
  };
}

/**
 * Get i18n configuration injected by the server
 */
function getI18nConfig(): I18nConfig {
  if (typeof window === 'undefined') {
    // Return defaults during SSR - hook will work properly after hydration
    return {
      defaultLocale: 'en',
      locales: ['en'],
      urlPattern: 'query',
      queryParam: 'lang',
      cookieName: 'locale',
    };
  }
  
  const configEl = document.getElementById('__HARPY_I18N_CONFIG__');
  if (!configEl) {
    console.warn('[useI18n] I18n config not found. Make sure i18n middleware is configured.');
    return {
      defaultLocale: 'en',
      locales: ['en'],
      urlPattern: 'query',
      queryParam: 'lang',
      cookieName: 'locale',
    };
  }
  
  try {
    return JSON.parse(configEl.textContent || '{}');
  } catch (error) {
    console.error('[useI18n] Failed to parse i18n config:', error);
    return {
      defaultLocale: 'en',
      locales: ['en'],
      urlPattern: 'query',
      queryParam: 'lang',
      cookieName: 'locale',
    };
  }
}

/**
 * Get current locale from DOM attribute or URL
 */
function getCurrentLocale(config: I18nConfig): string {
  // During SSR, return default locale
  if (typeof window === 'undefined') {
    return config.defaultLocale;
  }
  // Try to get from html lang attribute
  const htmlLang = document.documentElement.getAttribute('lang');
  if (htmlLang) {
    return htmlLang;
  }
  
  // Try to get from URL based on pattern
  const url = new URL(window.location.href);
  
  switch (config.urlPattern) {
    case 'query':
      const queryParam = config.queryParam || 'lang';
      return url.searchParams.get(queryParam) || config.defaultLocale;
      
    case 'path':
      const pathMatch = url.pathname.match(/^\/([a-z]{2})(\/|$)/);
      return pathMatch ? pathMatch[1] : config.defaultLocale;
      
    case 'cookie':
      return getCookie(config.cookieName || 'locale') || config.defaultLocale;
      
    default:
      return config.defaultLocale;
  }
}

/**
 * Switch locale via query parameter and navigate
 */
function switchLocaleViaQuery(newLocale: string, config: I18nConfig) {
  const url = new URL(window.location.href);
  const queryParam = config.queryParam || 'lang';
  
  // Update query parameter
  url.searchParams.set(queryParam, newLocale);
  
  // Navigate to new URL (triggers server reload with new locale)
  navigate(url.pathname + url.search);
}

/**
 * Switch locale via path pattern and navigate
 */
function switchLocaleViaPath(newLocale: string, config: I18nConfig) {
  const url = new URL(window.location.href);
  let pathname = url.pathname;
  
  // Remove existing locale from path if present
  const currentLocaleMatch = pathname.match(/^\/([a-z]{2})(\/|$)/);
  if (currentLocaleMatch && config.locales.includes(currentLocaleMatch[1])) {
    pathname = pathname.substring(3); // Remove /xx
  }
  
  // Add new locale to path
  if (newLocale !== config.defaultLocale) {
    pathname = `/${newLocale}${pathname || '/'}`;
  } else {
    pathname = pathname || '/';
  }
  
  // Navigate to new URL
  navigate(pathname + url.search);
}

/**
 * Switch locale via cookie and reload page
 */
function switchLocaleViaCookie(newLocale: string, config: I18nConfig) {
  const cookieName = config.cookieName || 'locale';
  
  // Set cookie with 1 year expiration
  const expires = new Date();
  expires.setFullYear(expires.getFullYear() + 1);
  document.cookie = `${cookieName}=${newLocale}; path=/; expires=${expires.toUTCString()}`;
  
  // Reload page to apply new locale from server
  window.location.reload();
}

/**
 * Helper to get cookie value
 */
function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : null;
}
