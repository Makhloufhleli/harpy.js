// We enumerate all dictionaries here for better linting and typescript support
// We also get the default import for cleaner types
const dictionaries = {
  en: () =>
    import('../dictionaries/en.json', { with: { type: 'json' } }).then(
      (module) => module.default,
    ),
  fr: () =>
    import('../dictionaries/fr.json', { with: { type: 'json' } }).then(
      (module) => module.default,
    ),
};

/**
 * Type representing the structure of a dictionary
 * Automatically inferred from the default locale (en)
 */
export type Dictionary = Awaited<ReturnType<typeof dictionaries.en>>;

/**
 * In-memory cache for loaded dictionaries
 * Prevents re-importing on every request
 */
const dictionaryCache = new Map<string, Dictionary>();

/**
 * Load dictionary for a given locale with caching
 * Dictionary is loaded once and cached in memory
 */
export const getDictionary = async (locale: string): Promise<Dictionary> => {
  // Check cache first
  if (dictionaryCache.has(locale)) {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[Dictionary] Cache hit for locale: ${locale}`);
    }
    return dictionaryCache.get(locale)!;
  }

  if (process.env.NODE_ENV !== 'production') {
    console.log(`[Dictionary] Loading and caching locale: ${locale}`);
  }

  // Load dictionary
  const dict = await (dictionaries[locale as keyof typeof dictionaries]?.() ?? dictionaries.en());
  
  // Cache it
  dictionaryCache.set(locale, dict);
  
  return dict;
};
