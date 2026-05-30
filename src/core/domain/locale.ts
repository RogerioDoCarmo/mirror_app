/**
 * BCP 47 language codes supported by Miroji.
 *
 * When the OS reports a language that is not in this set, or when detection
 * fails entirely, the application falls back to `'en'` (English).
 */
export type SupportedLocale = 'en' | 'pt' | 'es' | 'ja';

/** Ordered list of every locale the app ships translations for. */
export const SUPPORTED_LOCALES: readonly SupportedLocale[] = ['en', 'pt', 'es', 'ja'];

/** The locale used when detection fails or the OS language is unsupported. */
export const DEFAULT_LOCALE: SupportedLocale = 'en';

/**
 * Returns `true` when `code` is one of the four supported BCP 47 codes.
 *
 * Narrows the argument type to {@link SupportedLocale} on success.
 */
export function isSupportedLocale(code: string): code is SupportedLocale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(code);
}
