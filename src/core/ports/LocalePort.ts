import type { SupportedLocale } from '@/core/domain/locale';
import type { TranslationKey } from '@/core/domain/translations';

/**
 * Primary port for the locale and i18n subsystem.
 *
 * Adapters (e.g. `useExpoLocalization`) implement this interface; the UI
 * layer depends only on it, remaining decoupled from `expo-localization`.
 */
export interface ILocalePort {
  /** The active locale resolved from the OS, or the default `'en'`. */
  locale: SupportedLocale;
  /**
   * Returns the translated string for the given key in the active locale.
   *
   * Falls back gracefully to English when a key is unexpectedly missing.
   */
  t: (key: TranslationKey) => string;
}
