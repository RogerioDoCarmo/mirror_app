import { getLocales } from 'expo-localization';
import type { Locale } from 'expo-localization';
import { useExpoLocalization } from './ExpoLocalizationAdapter';

// This is the only test suite that may legitimately mock expo-localization —
// it is specifically testing the adapter that wraps it.
jest.mock('expo-localization', () => ({
  getLocales: jest.fn(),
}));

const mockGetLocales = jest.mocked(getLocales);

const makeLocale = (languageCode: string | null, languageTag = ''): Locale =>
  ({
    languageCode,
    languageTag: languageTag || languageCode || '',
    textDirection: 'ltr',
    digitGroupingSeparator: ',',
    decimalSeparator: '.',
    measurementSystem: 'metric',
    currencyCode: null,
    currencySymbol: null,
    regionCode: null,
    temperatureUnit: null,
  }) as Locale;

describe('useExpoLocalization', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns "en" when the OS locale list is empty', () => {
    // getLocales() is typed as [Locale, ...Locale[]] (non-empty) but can
    // return an empty array on some platforms — cast to cover the edge case.
    (mockGetLocales as jest.Mock).mockReturnValue([]);

    const { locale } = useExpoLocalization();

    expect(locale).toBe('en');
  });

  it('returns "en" when the first locale languageCode is null', () => {
    mockGetLocales.mockReturnValue([makeLocale(null)]);

    const { locale } = useExpoLocalization();

    expect(locale).toBe('en');
  });

  it('maps Portuguese (pt) device locale to "pt"', () => {
    mockGetLocales.mockReturnValue([makeLocale('pt', 'pt-BR')]);

    const { locale } = useExpoLocalization();

    expect(locale).toBe('pt');
  });

  it('maps Spanish (es) device locale to "es"', () => {
    mockGetLocales.mockReturnValue([makeLocale('es', 'es-MX')]);

    const { locale } = useExpoLocalization();

    expect(locale).toBe('es');
  });

  it('maps Japanese (ja) device locale to "ja"', () => {
    mockGetLocales.mockReturnValue([makeLocale('ja', 'ja-JP')]);

    const { locale } = useExpoLocalization();

    expect(locale).toBe('ja');
  });

  it('maps English (en) device locale to "en"', () => {
    mockGetLocales.mockReturnValue([makeLocale('en', 'en-US')]);

    const { locale } = useExpoLocalization();

    expect(locale).toBe('en');
  });

  it('falls back to "en" when OS language is unsupported (e.g. French)', () => {
    mockGetLocales.mockReturnValue([makeLocale('fr', 'fr-FR')]);

    const { locale } = useExpoLocalization();

    expect(locale).toBe('en');
  });

  it('uses the first supported locale when the list has multiple entries', () => {
    // OS preference order: French (unsupported), then Spanish (supported)
    mockGetLocales.mockReturnValue([makeLocale('fr', 'fr-FR'), makeLocale('es', 'es-ES')]);

    const { locale } = useExpoLocalization();

    expect(locale).toBe('es');
  });

  it('t() returns the English string for a valid key when locale is "en"', () => {
    mockGetLocales.mockReturnValue([makeLocale('en')]);

    const { t } = useExpoLocalization();

    expect(t('permission.grantButton')).toBe('Continue');
  });

  it('t() returns the Portuguese string for a valid key when locale is "pt"', () => {
    mockGetLocales.mockReturnValue([makeLocale('pt')]);

    const { t } = useExpoLocalization();

    expect(t('permission.grantButton')).toBe('Continuar');
  });

  it('t() returns the Spanish string for a valid key when locale is "es"', () => {
    mockGetLocales.mockReturnValue([makeLocale('es')]);

    const { t } = useExpoLocalization();

    expect(t('permission.cameraRequired')).toBe('Se requiere acceso a la cámara para usar Miroji.');
  });

  it('t() returns the Japanese string for a valid key when locale is "ja"', () => {
    mockGetLocales.mockReturnValue([makeLocale('ja')]);

    const { t } = useExpoLocalization();

    expect(t('permission.openSettings')).toBe(
      'デバイスの設定でカメラへのアクセスを有効にしてください。',
    );
  });

  it('t() falls back to English when locale is unsupported', () => {
    mockGetLocales.mockReturnValue([makeLocale('de')]);

    const { t } = useExpoLocalization();

    expect(t('permission.grantButton')).toBe('Continue');
  });
});
