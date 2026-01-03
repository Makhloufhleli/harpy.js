const cache = new Map<string, Record<string, any>>();

export async function getDictionary(locale: string): Promise<Record<string, any>> {
  if (cache.has(locale)) {
    return cache.get(locale)!;
  }
  
  try {
    const dict = await import(`../dictionaries/${locale}.json`);
    const result = dict.default || dict;
    cache.set(locale, result);
    return result;
  } catch (error) {
    console.warn(`[I18n] Failed to load dictionary for locale "${locale}", falling back to "en"`);
    if (cache.has('en')) {
      return cache.get('en')!;
    }
    const dict = await import('../dictionaries/en.json');
    const result = dict.default || dict;
    cache.set('en', result);
    return result;
  }
}
