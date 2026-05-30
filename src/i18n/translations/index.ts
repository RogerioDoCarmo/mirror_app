import type { SupportedLocale } from '@/core/domain/locale';
import type { TranslationMap } from '@/core/domain/translations';
import { en } from './en';
import { pt } from './pt';
import { es } from './es';
import { ja } from './ja';

/**
 * All translation maps keyed by {@link SupportedLocale}.
 *
 * Adding a new locale requires: (1) creating the translation file, (2) adding
 * it here, and (3) adding the code to {@link SupportedLocale}. TypeScript will
 * report a compile error at each step if any is missing.
 */
export const translations: Record<SupportedLocale, TranslationMap> = { en, pt, es, ja };
