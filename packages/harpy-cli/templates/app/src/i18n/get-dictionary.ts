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

export const getDictionary = async (locale: string): Promise<Dictionary> =>
  dictionaries[locale as keyof typeof dictionaries]?.() ?? dictionaries.en();
