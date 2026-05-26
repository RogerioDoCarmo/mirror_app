import React from 'react';
import { renderHook } from '@testing-library/react-native';
import { useExpoLocalization } from '@/adapters/expo-localization/ExpoLocalizationAdapter';
import { LocaleProvider, useLocale } from './LocaleProvider';

jest.mock('@/adapters/expo-localization/ExpoLocalizationAdapter', () => ({
  useExpoLocalization: jest.fn(),
}));

const mockUseExpoLocalization = jest.mocked(useExpoLocalization);

const mockPort = {
  locale: 'en' as const,
  t: jest.fn((key: string) => key),
};

describe('LocaleProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseExpoLocalization.mockReturnValue(mockPort);
  });

  it('provides the adapter value to consumers via useLocale', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(LocaleProvider, null, children);

    const { result } = renderHook(() => useLocale(), { wrapper });

    expect(result.current.locale).toBe('en');
  });

  it('useLocale throws when called outside a LocaleProvider', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);

    expect(() => renderHook(() => useLocale())).toThrow(
      'useLocale must be used inside a <LocaleProvider>',
    );

    consoleSpy.mockRestore();
  });
});
