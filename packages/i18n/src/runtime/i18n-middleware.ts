/**
 * I18n Middleware for Bun runtime
 * Detects and sets locale on requests from path, query, header, or cookie
 */

import type { I18nOptions } from './i18n-options';
import { normalizeI18nOptions } from './i18n-options';
import { parseCookies, serializeCookie } from '@harpy-js/core/runtime';

export interface I18nRequest extends Request {
  locale?: string;
  i18nContext?: {
    locale: string;
    setLocale: (locale: string) => void;
    availableLocales: string[];
  };
}

export interface I18nMiddlewareResult {
  locale: string;
  setCookie: boolean;
  cookieValue?: string;
  pathWithoutLocale?: string;
}

/**
 * Extract locale from URL path (e.g., /en/about -> 'en')
 */
function extractLocaleFromPath(
  pathname: string,
  locales: string[]
): { locale: string | null; pathWithoutLocale: string } {
  // Match /en, /en/, /en/something patterns
  const pathParts = pathname.split('/').filter(Boolean);
  
  if (pathParts.length > 0) {
    const firstSegment = pathParts[0].toLowerCase();
    if (locales.includes(firstSegment)) {
      // Remove locale from path
      const pathWithoutLocale = '/' + pathParts.slice(1).join('/');
      return {
        locale: firstSegment,
        pathWithoutLocale: pathWithoutLocale || '/',
      };
    }
  }
  
  return { locale: null, pathWithoutLocale: pathname };
}

/**
 * Create i18n middleware for Bun runtime
 */
export function createI18nMiddleware(options: I18nOptions) {
  const normalizedOptions = normalizeI18nOptions(options);
  const { locales, defaultLocale } = normalizedOptions;

  return async function i18nMiddleware(
    request: Request,
    next: () => Promise<Response>
  ): Promise<Response> {
    const result = detectLocale(request, normalizedOptions);
    
    // Attach locale to request (mutate for downstream handlers)
    (request as I18nRequest).locale = result.locale;
    (request as I18nRequest).i18nContext = {
      locale: result.locale,
      availableLocales: locales,
      setLocale: (newLocale: string) => {
        if (locales.includes(newLocale)) {
          (request as I18nRequest).locale = newLocale;
        }
      },
    };

    // If locale was detected from path, store the rewritten path
    if (result.pathWithoutLocale) {
      (request as any).__i18nRewrittenPath = result.pathWithoutLocale;
    }

    // Get response from next handler
    let response = await next();

    // Set locale cookie if needed
    if (result.setCookie && result.cookieValue) {
      const headers = new Headers(response.headers);
      headers.append('Set-Cookie', result.cookieValue);
      response = new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
      });
    }

    return response;
  };
}

/**
 * Detect locale from request using multiple sources
 * Priority: path > query > header > cookie > accept-language > default
 */
export function detectLocale(
  request: Request,
  options: Required<I18nOptions>
): I18nMiddlewareResult {
  const { locales, defaultLocale, urlPattern, cookieName, queryParam, headerName, detectFromAll } = options;
  const url = new URL(request.url);
  const cookies = parseCookies(request.headers.get('cookie') || '');

  let locale: string | undefined = undefined;
  let setCookie = false;
  let pathWithoutLocale: string | undefined = undefined;

  // Always try all detection methods if detectFromAll is true
  // Otherwise, only use the configured urlPattern
  
  // 1. Try path-based detection (highest priority)
  if (detectFromAll || urlPattern === 'path') {
    const pathResult = extractLocaleFromPath(url.pathname, locales);
    if (pathResult.locale) {
      locale = pathResult.locale;
      pathWithoutLocale = pathResult.pathWithoutLocale;
      setCookie = true;
    }
  }

  // 2. Try query parameter
  if (!locale && (detectFromAll || urlPattern === 'query')) {
    const queryLang = url.searchParams.get(queryParam);
    if (queryLang && locales.includes(queryLang.toLowerCase())) {
      locale = queryLang.toLowerCase();
      setCookie = true;
    }
  }

  // 3. Try header
  if (!locale && (detectFromAll || urlPattern === 'header')) {
    const headerLang = request.headers.get(headerName);
    if (headerLang && locales.includes(headerLang.toLowerCase())) {
      locale = headerLang.toLowerCase();
      setCookie = true;
    }
  }

  // 4. Fallback to cookie if not found
  const cookieLang = cookies[cookieName];
  if (!locale && cookieLang && locales.includes(cookieLang.toLowerCase())) {
    locale = cookieLang.toLowerCase();
  }

  // 5. Fallback to accept-language header
  if (!locale) {
    const acceptLanguage = request.headers.get('accept-language');
    if (acceptLanguage) {
      // Parse accept-language header (e.g., "en-US,en;q=0.9,fr;q=0.8")
      const languages = acceptLanguage.split(',').map((lang) => {
        const [code] = lang.trim().split(';');
        return code.split('-')[0].toLowerCase();
      });

      for (const lang of languages) {
        if (locales.includes(lang)) {
          locale = lang;
          break;
        }
      }
    }
  }

  // 6. Use default locale if nothing matched
  if (!locale) {
    locale = defaultLocale;
  }

  // Only set cookie if locale was explicitly set and differs from current
  const shouldSetCookie = setCookie && cookieLang !== locale;

  return {
    locale,
    setCookie: shouldSetCookie,
    pathWithoutLocale,
    cookieValue: shouldSetCookie
      ? serializeCookie(cookieName, locale, {
          path: '/',
          maxAge: 365 * 24 * 60 * 60, // 1 year
          httpOnly: false, // Allow client-side access for language switcher
          sameSite: 'Lax',
        })
      : undefined,
  };
}

/**
 * Get locale from request
 */
export function getLocaleFromRequest(request: Request): string {
  return (request as I18nRequest).locale || 'en';
}

/**
 * Get i18n context from request
 */
export function getI18nContextFromRequest(request: Request) {
  return (request as I18nRequest).i18nContext;
}
