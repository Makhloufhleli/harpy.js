import type { NestedKeyOf, DeepValue, ExtractVariables } from "./i18n-types";

/**
 * Type-safe translation function - extracts translated values from dictionary
 * Provides full type safety including:
 * - Key autocomplete from dictionary structure
 * - Required variables detection and type checking
 * - Return type inference
 *
 * @param dict - The dictionary object containing translations
 * @param key - The key to lookup (supports nested keys with dot notation)
 * @param vars - Optional variables for interpolation using {{variable}} syntax
 *
 * @example
 * ```typescript
 * // Simple translation
 * t(dict, 'welcome') // Type-safe key, returns string
 *
 * // Nested key
 * t(dict, 'nav.home') // Autocomplete for nested keys
 *
 * // With variables
 * t(dict, 'greeting', { name: 'John' }) // Variables are type-checked
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
  // Resolve nested keys
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
  const value = key.split(".").reduce((acc, k) => acc?.[k], dict as any);

  if (typeof value !== "string") return "";
  return value.replace(/\{\{(.*?)\}\}/g, (_match: string, k: string) =>
    String(vars?.[k.trim()] ?? ""),
  );
}

/**
 * Unsafe version of t() for dynamic keys or when types are not available
 * Use this only when you need to bypass type checking
 */
export function tUnsafe(
  dict: Record<string, any>,
  key: string,
  vars?: Record<string, string | number>,
): string {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
  const value = key.split(".").reduce((acc, k) => acc?.[k], dict as any);

  if (typeof value !== "string") return "";
  return value.replace(/\{\{(.*?)\}\}/g, (_match: string, k: string) =>
    String(vars?.[k.trim()] ?? ""),
  );
}
