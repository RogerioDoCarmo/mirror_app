import { getLocales } from 'expo-localization';
import { DEFAULT_LOCALE, isSupportedLocale } from '@/core/domain/locale';
import type { SupportedLocale } from '@/core/domain/locale';
import type { ILocalePort } from '@/core/ports/LocalePort';
import type { TranslationKey } from '@/core/domain/translations';
import { translations } from '@/i18n/translations';

/**
 * Resolves the active {@link SupportedLocale} from the OS preference list.
 *
 * Iterates `getLocales()` in preference order (index 0 = most preferred) and
 * returns the first language whose two-letter code matches a supported locale.
 * Falls back to {@link DEFAULT_LOCALE} when no match is found or when
 * `getLocales()` returns an empty array.
 */
function resolveLocale(): SupportedLocale {
  try {
    const locales = getLocales();
    for (const locale of locales) {
      const code = locale.languageCode ?? '';
      if (isSupportedLocale(code)) {
        return code;
      }
    }
  } catch {
    // Native module unavailable during JS cold-start — fall back to English.
  }
  return DEFAULT_LOCALE;
}

/**
 * Non-reactive adapter implementing {@link ILocalePort} via `expo-localization`.
 *
 * This is the **only** file in the application that imports from
 * `expo-localization`, keeping the rest of the codebase library-agnostic.
 *
 * The locale is resolved once when the function is called (at React render
 * time inside {@link LocaleProvider}). On iOS the value is stable for the
 * lifetime of the app process; on Android it may change if the user switches
 * language in Settings — the app requires a restart to pick up changes, which
 * is standard behaviour for apps without dynamic locale switching.
 */
export function useExpoLocalization(): ILocalePort {
  const locale = resolveLocale();

  const t = (key: TranslationKey): string => {
    // TranslationMap is Record<TranslationKey, string> — every key is
    // statically guaranteed to exist, so no runtime fallback is needed.
    return translations[locale][key];
  };

  return { locale, t };
}
