/**
 * Every translation key used across the application.
 *
 * Adding a new key here forces TypeScript to require it in every locale
 * translation file, guaranteeing no string is left untranslated.
 */
export type TranslationKey =
  | 'permission.cameraRequired'
  | 'permission.grantButton'
  | 'permission.openSettings'
  | 'permission.openSettingsButton';

/**
 * A complete set of UI strings for one locale.
 *
 * The type is a strict record so TypeScript reports a compile error if any
 * {@link TranslationKey} is missing from a translation file.
 */
export type TranslationMap = Record<TranslationKey, string>;
