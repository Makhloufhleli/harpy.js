/**
 * Translation functions for Bun runtime
 * Type-safe translation with variable interpolation
 */

import type { NestedKeyOf, DeepValue, ExtractVariables } from '../i18n-types';

/**
 * Type-safe translation function
 * 
 * @example
 * ```typescript
 * const dict = { home: { title: 'Welcome, {{name}}!' } };
 * t(dict, 'home.title', { name: 'John' }); // 'Welcome, John!'
 * ```
 */
export function t<
  TDict extends Record<string, any>,
  TKey extends NestedKeyOf<TDict>,
>(
  dict: TDict,
  key: TKey,
  vars?: DeepValue<TDict, TKey> extends string
    ? ExtractVariables<DeepValue<TDict, TKey>>
    : Record<string, string | number>,
): string {
  const value = key.split('.').reduce((acc, k) => acc?.[k], dict as any);

  if (typeof value !== 'string') return '';
  return value.replace(/\{\{(.*?)\}\}/g, (_match: string, k: string) =>
    String(vars?.[k.trim()] ?? '')
  );
}

/**
 * Unsafe translation function without type checking
 * 
 * @example
 * ```typescript
 * const dict = { home: { title: 'Welcome!' } };
 * tUnsafe(dict, 'home.title'); // 'Welcome!'
 * ```
 */
export function tUnsafe(
  dict: Record<string, any>,
  key: string,
  vars?: Record<string, string | number>,
): string {
  const value = key.split('.').reduce((acc, k) => acc?.[k], dict as any);

  if (typeof value !== 'string') return '';
  return value.replace(/\{\{(.*?)\}\}/g, (_match: string, k: string) =>
    String(vars?.[k.trim()] ?? '')
  );
}

/**
 * Create a bound translation function for a specific dictionary
 * 
 * @example
 * ```typescript
 * const dict = { home: { title: 'Welcome!' } };
 * const translate = createTranslator(dict);
 * translate('home.title'); // 'Welcome!'
 * ```
 */
export function createTranslator<TDict extends Record<string, any>>(dict: TDict) {
  return function translate<TKey extends NestedKeyOf<TDict>>(
    key: TKey,
    vars?: DeepValue<TDict, TKey> extends string
      ? ExtractVariables<DeepValue<TDict, TKey>>
      : Record<string, string | number>,
  ): string {
    return t(dict, key, vars);
  };
}
