import type { NestedKeyOf, DeepValue, ExtractVariables } from './i18n-types';

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
    String(vars?.[k.trim()] ?? ''),
  );
}

export function tUnsafe(
  dict: Record<string, any>,
  key: string,
  vars?: Record<string, string | number>,
): string {
  const value = key.split('.').reduce((acc, k) => acc?.[k], dict as any);

  if (typeof value !== 'string') return '';
  return value.replace(/\{\{(.*?)\}\}/g, (_match: string, k: string) =>
    String(vars?.[k.trim()] ?? ''),
  );
}
